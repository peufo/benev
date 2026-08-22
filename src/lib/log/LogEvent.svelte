<script lang="ts">
	import type { EventState } from '@prisma/client'
	import type { LogTyped } from './logMap'
	import { eventLabels } from './logLabels'
	import { snippetRef } from './Snippets.svelte'
	import LogDiff from './LogDiff.svelte'

	type Types = 'event_create' | 'event_state' | 'event_update'
	let { log, timezone }: { log: LogTyped<Types>; timezone?: string } = $props()

	const stateLabels: Record<EventState, string> = {
		draft: 'Brouillon',
		published: 'Publié',
		archived: 'Archivé',
	}
	const stateClass: Record<EventState, string> = {
		draft: 'badge-ghost',
		published: 'badge-success',
		archived: 'badge-warning',
	}
</script>

<p>
	{@render snippetRef(log.data.actor)}
	{#if log.type === 'event_create'}
		a créé l'évènement
		{#if log.data.clonedFrom}
			à partir de {@render snippetRef(log.data.clonedFrom)}
		{/if}
	{:else if log.type === 'event_state'}
		a changé le statut de l'évènement
	{:else}
		a modifié les réglages de l'évènement
	{/if}
</p>

{#if log.type === 'event_state'}
	<div class="flex items-center flex-wrap gap-2 mt-1">
		<span class="badge badge-sm {stateClass[log.data.before]} badge-outline">
			{stateLabels[log.data.before]}
		</span>
		<span aria-hidden="true">→</span>
		<span class="badge badge-sm {stateClass[log.data.after]}">{stateLabels[log.data.after]}</span>
	</div>
{:else if log.type === 'event_update'}
	<LogDiff changes={log.data.changes} labels={eventLabels} {timezone} />
{/if}
