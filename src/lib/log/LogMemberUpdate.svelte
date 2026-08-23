<script lang="ts">
	import type { LogTyped } from './logMap'
	import { memberContactLabels } from './logProject'
	import { snippetRef } from './Snippets.svelte'
	import LogDiff from './LogDiff.svelte'

	let { log, timezone }: { log: LogTyped<'member_update'>; timezone?: string } = $props()
</script>

<p>
	{@render snippetRef(log.data.actor)} a modifié la fiche de {@render snippetRef(log.data.member)}
</p>

{#if log.data.contact}
	<LogDiff changes={log.data.contact} labels={memberContactLabels} {timezone} />
{/if}

{#if log.data.profile}
	<LogDiff changes={log.data.profile} {timezone} />
{/if}
