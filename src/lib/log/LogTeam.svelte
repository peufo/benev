<script lang="ts">
	import type { TeamState } from '@prisma/client'
	import { TEAM_STATES } from '$lib/constant'
	import type { LogTyped } from './logMap'
	import { teamLabels } from './logProject'
	import { snippetRef } from './Snippets.svelte'
	import LogDiff from './LogDiff.svelte'

	type Types = 'team_create' | 'team_update' | 'team_state' | 'team_delete'
	let { log, timezone }: { log: LogTyped<Types>; timezone?: string } = $props()

	const verbs: Record<Types, string> = {
		team_create: 'a créé le secteur',
		team_update: 'a modifié le secteur',
		team_state: 'a changé le statut du secteur',
		team_delete: 'a supprimé le secteur',
	}

	const stateClass: Record<TeamState, string> = {
		draft: 'badge-ghost',
		validated: 'badge-info',
		published: 'badge-success',
	}
</script>

<p>
	{#if log.type === 'team_state' && !log.data.actor}
		Comme programmé, le statut du secteur {@render snippetRef(log.data.team)} a changé
	{:else}
		{@render snippetRef(log.data.actor)}
		{verbs[log.type]}
		{@render snippetRef(log.data.team)}
	{/if}
</p>

{#if log.type === 'team_update'}
	<LogDiff changes={log.data.changes} labels={teamLabels} {timezone} />
{:else if log.type === 'team_state'}
	<div class="flex items-center flex-wrap gap-2 mt-1">
		<span class="badge badge-sm {stateClass[log.data.before]} badge-outline">
			{TEAM_STATES[log.data.before].label}
		</span>
		<span aria-hidden="true">→</span>
		<span class="badge badge-sm {stateClass[log.data.after]}"
			>{TEAM_STATES[log.data.after].label}</span
		>
	</div>
{/if}
