<script lang="ts">
	import type { LogTyped } from './logMap'
	import { periodLabels } from './logProject'
	import { snippetPeriod, snippetRef } from './Snippets.svelte'
	import LogDiff from './LogDiff.svelte'

	type Types = 'period_create' | 'period_update' | 'period_delete'
	let { log, timezone }: { log: LogTyped<Types>; timezone?: string } = $props()

	const verbs: Record<Types, string> = {
		period_create: 'a ajouté un créneau à',
		period_update: 'a modifié un créneau de',
		period_delete: 'a retiré un créneau de',
	}
</script>

<p>
	{@render snippetRef(log.data.actor)}
	{verbs[log.type]}
	{@render snippetRef(log.data.team)}
</p>

<div class="flex items-center flex-wrap gap-2 mt-1 text-base-content/70">
	{@render snippetPeriod(log.data.period, timezone)}
	<span class="badge badge-ghost badge-sm">
		{log.data.period.maxSubscribe}
		{log.data.period.maxSubscribe > 1 ? 'places' : 'place'}
	</span>
	{#if log.type === 'period_update'}
		{@const n = log.data.notified}
		<span class="badge badge-sm {n ? 'badge-info' : 'badge-ghost'}">
			{n ? `${n} inscrit·e${n > 1 ? 's' : ''} prévenu·e${n > 1 ? 's' : ''}` : 'aucun courriel'}
		</span>
	{/if}
</div>

{#if log.type === 'period_update'}
	<LogDiff changes={log.data.changes} labels={periodLabels} {timezone} />
{/if}
