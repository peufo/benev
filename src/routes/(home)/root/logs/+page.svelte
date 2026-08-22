<script lang="ts">
	import { InputOptionInParam } from '$lib/ui'
	import { LOG_TYPES, Logs } from '$lib/log'
	import { loadPreviousRootLogs } from './logs.remote'

	let { data } = $props()

	// Ici le filtre porte sur le type brut, et non sur les familles de l'onglet d'un évènement:
	// cette page sert l'exploitation, qui cherche `email_failed`, pas « les emails ».
	const types = Object.fromEntries(LOG_TYPES.map((type) => [type, type]))
</script>

<div class="max-w-4xl mx-auto">
	<div class="flex flex-wrap gap-1 mb-4">
		<InputOptionInParam key="type" options={types} />
	</div>

	<!-- Pas de `timezone`: hors évènement, `page.data.event` n'existe pas. -->
	{#key data.type}
		<Logs
			logs={data.logs}
			hasMore={data.hasMore}
			showEvent
			loadPrevious={(beforeId) => loadPreviousRootLogs({ beforeId, type: data.type })}
		/>
	{/key}
</div>
