<script lang="ts">
	import type { LogTyped } from './logMap'
	import { memberContactLabels } from './logLabels'
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

{#if log.data.fields?.length}
	<div class="flex items-center flex-wrap gap-1 mt-1">
		<span class="text-base-content/70">Champs de profil&nbsp;:</span>
		{#each log.data.fields as field (field)}
			<span class="badge badge-ghost badge-sm">{field}</span>
		{/each}
	</div>
{/if}
