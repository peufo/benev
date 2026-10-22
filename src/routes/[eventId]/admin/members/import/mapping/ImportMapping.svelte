<script lang="ts">
	import { invalidateAll } from '$app/navigation'
	import { tip } from 'fuma'
	import type { Field } from '@prisma/client'
	import { eventPath } from '#lib/eventPath.js'
	import { plural } from '#lib/utils.js'
	import { Placeholder, Surface } from '#lib/ui/index.js'
	import {
		isBlocking,
		type ColumnStatus,
		type ColumnTarget,
		type ImportField,
		type ImportTable,
	} from '#lib/member/import/index.js'
	import { importSource } from '../importSource.svelte'
	import ColumnHeader from './ColumnHeader.svelte'
	import { ImportPreview } from './importPreview.svelte'
	import ImportBar from './ImportBar.svelte'
	import ValueMapDialog from './ValueMapDialog.svelte'

	interface Props {
		/** Ce que le titre et le journal disent de la source: le nom du fichier ou de l'évènement. */
		sourceName: string
		table: ImportTable
		fields: ImportField[]
		/** Le numéro de la première ligne: 2 sous l'en-tête d'un fichier, 1 pour un évènement. */
		firstLine: number
		/** Ce que la source appelle une ligne vide, quand elle n'en a aucune. */
		emptyMessage: string
	}

	let { sourceName, table, fields, firstLine, emptyMessage }: Props = $props()

	const source = importSource.get()
	/** La colonne dont on fait correspondre les valeurs, le temps du dialogue. */
	let mappedColumn: number | null = $state(null)
	let importing = $state(false)

	const preview = new ImportPreview({
		get table() {
			return table
		},
		get fields() {
			return fields
		},
		get firstLine() {
			return firstLine
		},
		get mapping() {
			return source.mapping
		},
		get excluded() {
			return source.excluded
		},
	})

	const toCheck = $derived(
		preview.reports.filter(({ status }) => status === 'unmapped' || isBlocking(status)).length
	)
	const ignoredColumns = $derived(
		preview.reports.filter(({ status }) => status === 'ignored' || status === 'unmapped').length
	)
	const mappedField = $derived.by(() => {
		if (mappedColumn === null) return undefined
		const target = source.mapping[mappedColumn]
		return fields.find((field) => `field:${field.id}` === target)
	})

	const allChecked = $derived(!source.excluded.size)
	const noneChecked = $derived(source.excluded.size === table.rows.length)

	const columnClass: Record<ColumnStatus, string> = {
		ok: '',
		ignored: 'opacity-50',
		unmapped: 'bg-warning/10',
		duplicate: 'bg-error/10',
		invalid: 'bg-error/10',
	}

	function setTarget(column: number, target: ColumnTarget) {
		source.mapping[column] = target
	}

	function toggleRow(index: number, checked: boolean) {
		if (checked) source.excluded.delete(index)
		else source.excluded.add(index)
	}

	function toggleAll(checked: boolean) {
		source.excluded.clear()
		if (!checked) table.rows.forEach((_, index) => source.excluded.add(index))
	}

	// Le champ n'existe dans `fields` qu'une fois les données rechargées.
	async function handleFieldCreated(column: number, field: Field) {
		await invalidateAll()
		source.mapping[column] = `field:${field.id}`
	}
</script>

<Surface back title="Importer depuis « {sourceName} »">
	{#if !table.rows.length}
		<Placeholder>
			<p>{emptyMessage}</p>
			<a class="link" href={eventPath('/admin/members/import')}>Choisir une autre source</a>
		</Placeholder>
	{:else}
		<p class="px-2 pb-3 text-sm text-base-content/70">
			{plural(table.rows.length, 'ligne', 'lignes')}
			· {plural(table.headers.length, 'colonne', 'colonnes')}
			{#if toCheck}
				· <strong class="text-base-content">
					{plural(toCheck, 'colonne à vérifier', 'colonnes à vérifier')}
				</strong>
			{/if}
		</p>

		<!-- Pendant l'import, le mappage et les valeurs ne bougent plus. -->
		<fieldset
			disabled={importing}
			class="max-h-[70vh] min-w-0 overflow-auto rounded-box border border-soft"
		>
			<table class="table table-sm table-pin-rows">
				<thead>
					<tr>
						<th class="w-0 align-bottom">
							<input
								type="checkbox"
								class="checkbox checkbox-sm"
								aria-label="Importer toutes les lignes"
								checked={allChecked}
								indeterminate={!allChecked && !noneChecked}
								onchange={(e) => toggleAll(e.currentTarget.checked)}
							/>
						</th>
						<th class="w-0 align-bottom text-base-content/50">#</th>
						{#each table.headers as header, column (column)}
							{@const columnReport = preview.columns[column].report}
							<th class={['min-w-56 align-top font-normal', columnClass[columnReport.status]]}>
								<ColumnHeader
									{header}
									{column}
									rows={table.rows}
									hint={table.hints?.[column]}
									target={source.mapping[column]}
									report={columnReport}
									{fields}
									onchange={(target) => setTarget(column, target)}
									oncreated={(field) => handleFieldCreated(column, field)}
									onmapvalues={() => (mappedColumn = column)}
								/>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each table.rows as row, index (index)}
						{@const line = index + firstLine}
						{@const isExcluded = source.excluded.has(index)}
						<tr class={[isExcluded && 'opacity-50']}>
							<td>
								<input
									type="checkbox"
									class="checkbox checkbox-sm"
									aria-label="Importer la ligne {line}"
									checked={!isExcluded}
									onchange={(e) => toggleRow(index, e.currentTarget.checked)}
								/>
							</td>
							<td class="text-base-content/50">{line}</td>
							{#each row as cell, column (column)}
								<!-- Lus un à un: quand la colonne se revalide, seules les cellules dont le motif
								change se mettent à jour. -->
								{@const status = preview.columns[column].report.status}
								{@const issue =
									isExcluded || status === 'ignored'
										? undefined
										: preview.columns[column].issues.get(index)}
								<td class={['p-0', columnClass[status], issue && 'bg-error/15']}>
									<!-- Réécrite à la validation, pas à chaque frappe: seule sa colonne se revalide. -->
									<input
										class="input input-ghost input-sm w-full min-w-24 bg-transparent"
										aria-label="Ligne {line}, colonne « {table.headers[column]} »"
										aria-invalid={!!issue}
										value={cell}
										onchange={(e) => (row[column] = e.currentTarget.value.trim())}
										use:tip={{ content: issue ?? '', disable: !issue }}
									/>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</fieldset>

		<ImportBar
			{sourceName}
			rows={preview.members.rows}
			skipped={preview.members.skipped}
			blocker={preview.blocker}
			{ignoredColumns}
			bind:importing
		/>
	{/if}
</Surface>

{#if mappedColumn !== null && mappedField}
	<ValueMapDialog
		columnName={table.headers[mappedColumn]}
		column={mappedColumn}
		rows={table.rows}
		field={mappedField}
		onclose={() => (mappedColumn = null)}
	/>
{/if}
