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

	const MESSAGES = {
		csv: {
			unreadable: 'Ce fichier ne se lit pas comme un CSV.',
			empty: 'Ce fichier ne contient aucune ligne de membre.',
		},
		paste: {
			unreadable: 'Ces données ne se lisent pas comme un tableau.',
			empty: 'Ces données ne contiennent aucune ligne de membre.',
		},
	}

	// Le texte ne survit pas à un rechargement: sans lui, il n'y a rien à mapper.
	onMount(async () => {
		const text = source.text
		if (!text) return goto(eventPath('/admin/members/import'), { replace: true })
		if (source.key === text.kind && source.table) return
		try {
			source.load(text.kind, parseCsv(await text.read(), { header: text.header }), data.fields)
		} catch {
			readError = true
		}
	})
</script>

{#if source.text}
	{@const text = source.text}
	{#if source.key === text.kind && source.table}
		<ImportMapping
			sourceName={text.name}
			table={source.table}
			fields={data.fields}
			firstLine={text.header ? 2 : 1}
			emptyMessage={MESSAGES[text.kind].empty}
		/>
	{:else}
		<Surface back title="Importer depuis « {text.name} »">
			{#if readError}
				<Placeholder>
					<p>{MESSAGES[text.kind].unreadable}</p>
					<a class="link" href={eventPath('/admin/members/import')}>Choisir une autre source</a>
				</Placeholder>
			{:else}
				<Placeholder><span class="loading loading-spinner"></span></Placeholder>
			{/if}
		</Surface>
	{/if}
{/if}
