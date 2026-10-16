<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { eventPath } from '#lib/eventPath.js'
	import { Placeholder, Surface } from '#lib/ui/index.js'
	import { importSource } from '../importSource.svelte'

	const source = importSource.get()

	// Le fichier ne survit pas à un rechargement: sans lui, il n'y a rien à mapper.
	onMount(() => {
		if (!source.csv) goto(eventPath('/admin/members/import'), { replaceState: true })
	})
</script>

{#if source.csv}
	<Surface back title="Importer depuis « {source.csv.name} »">
		<Placeholder>Le mappage des colonnes arrive bientôt.</Placeholder>
	</Surface>
{/if}
