<script lang="ts">
	import type { LogTyped } from './logMap'
	import { teamLabels } from './logLabels'
	import { snippetRef } from './Snippets.svelte'
	import LogDiff from './LogDiff.svelte'

	type Types = 'team_create' | 'team_update' | 'team_delete'
	let { log, timezone }: { log: LogTyped<Types>; timezone?: string } = $props()

	const verbs: Record<Types, string> = {
		team_create: 'a créé le secteur',
		team_update: 'a modifié le secteur',
		team_delete: 'a supprimé le secteur',
	}
</script>

<p>
	{@render snippetRef(log.data.actor)}
	{verbs[log.type]}
	{@render snippetRef(log.data.team)}
</p>

{#if log.type === 'team_update'}
	<LogDiff changes={log.data.changes} labels={teamLabels} {timezone} />
{/if}
