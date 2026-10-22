<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { eventPath } from '#lib/eventPath.js'
	import { Placeholder, Surface } from '#lib/ui/index.js'
	import { parseCsv } from '#lib/member/import/index.js'
	import { importSource } from '../importSource.svelte'
	import ImportMapping from '../mapping/ImportMapping.svelte'

	let { data } = $props()

	const source = importSource.get()
	let readError = $state(false)

	// Le fichier ne survit pas à un rechargement: sans lui, il n'y a rien à mapper.
	onMount(async () => {
		if (!source.csv) return goto(eventPath('/admin/members/import'), { replaceState: true })
		if (source.key === 'csv' && source.table) return
		try {
			source.load('csv', parseCsv(await source.csv.text()), data.fields)
		} catch {
			readError = true
		}
	})
</script>

{#if source.csv}
	{#if source.key === 'csv' && source.table}
		<ImportMapping
			sourceName={source.csv.name}
			table={source.table}
			fields={data.fields}
			firstLine={2}
			emptyMessage="Ce fichier ne contient aucune ligne de membre."
		/>
	{:else}
		<Surface back title="Importer depuis « {source.csv.name} »">
			{#if readError}
				<Placeholder>
					<p>Ce fichier ne se lit pas comme un CSV.</p>
					<a class="link" href={eventPath('/admin/members/import')}>Choisir une autre source</a>
				</Placeholder>
			{:else}
				<Placeholder><span class="loading loading-spinner"></span></Placeholder>
			{/if}
		</Surface>
	{/if}
{/if}
