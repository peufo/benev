<script lang="ts">
	import { onMount } from 'svelte'
	import { goto, invalidateAll } from '$app/navigation'
	import { tip } from 'fuma'
	import type { Field } from '@prisma/client'
	import { eventPath } from '#lib/eventPath.js'
	import { Placeholder, Surface } from '#lib/ui/index.js'
	import {
		guessMapping,
		parseCsv,
		reportColumns,
		type ColumnStatus,
		type ColumnTarget,
	} from '#lib/member/import/index.js'
	import { importSource } from '../importSource.svelte'
	import ColumnHeader from './ColumnHeader.svelte'
	import ValueMapDialog from './ValueMapDialog.svelte'

	let { data } = $props()

	const source = importSource.get()
	let readError = $state(false)
	/** La colonne dont on fait correspondre les valeurs, le temps du dialogue. */
	let mappedColumn: number | null = $state(null)

	// Le fichier ne survit pas à un rechargement: sans lui, il n'y a rien à mapper.
	onMount(async () => {
		if (!source.csv) return goto(eventPath('/admin/members/import'), { replaceState: true })
		if (source.table) return
		try {
			const table = parseCsv(await source.csv.text())
			source.mapping = guessMapping(table.headers, data.fields)
			source.table = table
		} catch {
			readError = true
		}
	})

	const report = $derived(source.table && reportColumns(source.table, source.mapping, data.fields))
	const toCheck = $derived(
		report?.filter(
			({ status }) => status === 'unmapped' || status === 'duplicate' || status === 'invalid'
		).length ?? 0
	)
	const mappedField = $derived.by(() => {
		if (mappedColumn === null) return undefined
		const target = source.mapping[mappedColumn]
		return data.fields.find((field) => `field:${field.id}` === target)
	})

	const columnClass: Record<ColumnStatus, string> = {
		ok: '',
		ignored: 'opacity-50',
		unmapped: 'bg-warning/10',
		duplicate: '',
		invalid: '',
	}

	function plural(count: number, singular: string, plural: string) {
		return `${count} ${count > 1 ? plural : singular}`
	}

	function setTarget(column: number, target: ColumnTarget) {
		source.mapping[column] = target
	}

	// Le champ n'existe dans `data.fields` qu'une fois les données rechargées.
	async function handleFieldCreated(column: number, field: Field) {
		await invalidateAll()
		source.mapping[column] = `field:${field.id}`
	}
</script>

{#if source.csv}
	<Surface back title="Importer depuis « {source.csv.name} »">
		{#if readError}
			<Placeholder>
				<p>Ce fichier ne se lit pas comme un CSV.</p>
				<a class="link" href={eventPath('/admin/members/import')}>Choisir une autre source</a>
			</Placeholder>
		{:else if source.table && report}
			{#if !source.table.rows.length}
				<Placeholder>
					<p>Ce fichier ne contient aucune ligne de membre.</p>
					<a class="link" href={eventPath('/admin/members/import')}>Choisir une autre source</a>
				</Placeholder>
			{:else}
				<p class="px-2 pb-3 text-sm text-base-content/70">
					{plural(source.table.rows.length, 'ligne', 'lignes')}
					· {plural(source.table.headers.length, 'colonne', 'colonnes')}
					{#if toCheck}
						· <strong class="text-base-content">
							{plural(toCheck, 'colonne à vérifier', 'colonnes à vérifier')}
						</strong>
					{/if}
				</p>

				<div class="max-h-[70vh] overflow-auto rounded-box border border-soft">
					<table class="table table-sm table-pin-rows">
						<thead>
							<tr>
								<th class="w-0 align-bottom text-base-content/50">#</th>
								{#each source.table.headers as header, column (column)}
									{@const columnReport = report[column]}
									<th
										class={[
											'min-w-56 align-top font-normal',
											columnClass[columnReport.status],
											(columnReport.status === 'duplicate' || columnReport.status === 'invalid') &&
												'bg-error/10',
										]}
									>
										<ColumnHeader
											{header}
											{column}
											rows={source.table.rows}
											target={source.mapping[column]}
											report={columnReport}
											fields={data.fields}
											onchange={(target) => setTarget(column, target)}
											oncreated={(field) => handleFieldCreated(column, field)}
											onmapvalues={() => (mappedColumn = column)}
										/>
									</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each source.table.rows as row, index (index)}
								<tr>
									<td class="text-base-content/50">{index + 2}</td>
									{#each row as cell, column (column)}
										{@const { status, invalid } = report[column]}
										{@const issue = status === 'ignored' ? undefined : invalid.get(index)}
										<td class={['p-0', columnClass[status], issue && 'bg-error/15']}>
											<!-- Réécrite à la validation, pas à chaque frappe: toute la table se revalide. -->
											<input
												class="input input-ghost input-sm w-full min-w-24 bg-transparent"
												aria-label="Ligne {index + 2}, colonne « {source.table.headers[column]} »"
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
				</div>
			{/if}
		{:else}
			<Placeholder><span class="loading loading-spinner"></span></Placeholder>
		{/if}
	</Surface>

	{#if source.table && mappedColumn !== null && mappedField}
		<ValueMapDialog
			columnName={source.table.headers[mappedColumn]}
			column={mappedColumn}
			rows={source.table.rows}
			field={mappedField}
			onclose={() => (mappedColumn = null)}
		/>
	{/if}
{/if}
