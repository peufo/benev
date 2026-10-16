<script lang="ts">
	import { CircleXIcon, TriangleAlertIcon } from '@lucide/svelte'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { tip } from 'fuma'
	import { eventPath } from '#lib/eventPath.js'
	import { Placeholder, Surface } from '#lib/ui/index.js'
	import {
		CONTACT_TARGETS,
		guessMapping,
		parseCsv,
		reportColumns,
		type ColumnStatus,
		type ColumnTarget,
	} from '#lib/member/import/index.js'
	import { importSource } from '../importSource.svelte'

	let { data } = $props()

	const source = importSource.get()
	let readError = $state(false)

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

	function setTarget(column: number, value: string) {
		source.mapping[column] = (value || null) as ColumnTarget
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
									{@const { status, invalid } = report[column]}
									<th
										class={[
											'min-w-48 align-top font-normal',
											columnClass[status],
											(status === 'duplicate' || status === 'invalid') && 'bg-error/10',
										]}
									>
										<div class="flex flex-col gap-1">
											<span class="font-semibold text-base-content">{header}</span>
											<select
												class="select select-sm w-full"
												aria-label="Champ pour la colonne « {header} »"
												value={source.mapping[column] ?? ''}
												onchange={(e) => setTarget(column, e.currentTarget.value)}
											>
												<option value="" disabled>Choisir un champ</option>
												<option value="ignore">Ignorer la colonne</option>
												<optgroup label="Coordonnées">
													{#each Object.entries(CONTACT_TARGETS) as [key, label] (key)}
														<option value="contact:{key}">{label}</option>
													{/each}
												</optgroup>
												{#if data.fields.length}
													<optgroup label="Profil">
														{#each data.fields as field (field.id)}
															<option value="field:{field.id}">{field.name}</option>
														{/each}
													</optgroup>
												{/if}
											</select>
											{#if status === 'unmapped'}
												<span class="flex items-center gap-1 text-xs">
													<TriangleAlertIcon size={14} class="text-warning shrink-0" />
													Aucun champ trouvé
												</span>
											{:else if status === 'duplicate'}
												<span class="flex items-center gap-1 text-xs">
													<CircleXIcon size={14} class="text-error shrink-0" />
													Champ déjà utilisé
												</span>
											{:else if status === 'invalid'}
												<span class="flex items-center gap-1 text-xs">
													<CircleXIcon size={14} class="text-error shrink-0" />
													{plural(invalid.size, 'valeur invalide', 'valeurs invalides')}
												</span>
											{/if}
										</div>
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
										{@const issue = invalid.get(index)}
										<td
											class={[
												'max-w-64 truncate',
												columnClass[status],
												status !== 'ignored' && issue && 'bg-error/15',
											]}
										>
											{#if status !== 'ignored' && issue}
												<span use:tip={{ content: issue }}>{cell}</span>
											{:else}
												{cell}
											{/if}
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
{/if}
