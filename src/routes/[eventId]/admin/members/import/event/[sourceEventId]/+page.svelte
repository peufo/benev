<script lang="ts">
	import { untrack } from 'svelte'
	import { importSource } from '../../importSource.svelte'
	import ImportMapping from '../../mapping/ImportMapping.svelte'

	let { data } = $props()

	const source = importSource.get()
	const key = $derived(`event:${data.sourceEvent.id}`)

	// Chargée dès l'initialisation, et non au montage: la table vient du serveur et se rend en SSR.
	// Changer d'évènement source repasse par le choix de la source, qui démonte cette page.
	untrack(() => source.load(key, data.table, data.fields))
</script>

{#if source.key === key && source.table}
	<ImportMapping
		sourceName={data.sourceEvent.name}
		table={source.table}
		fields={data.fields}
		firstLine={1}
		emptyMessage="Cet évènement n'a aucun membre."
	/>
{/if}
