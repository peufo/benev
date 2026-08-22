<script lang="ts">
	import type { LogTyped } from './logMap'
	import { snippetPeriod, snippetRef } from './Snippets.svelte'

	type Types = 'period_create' | 'period_delete'
	let { log, timezone }: { log: LogTyped<Types>; timezone?: string } = $props()
</script>

<p>
	{@render snippetRef(log.data.actor)}
	{log.type === 'period_create' ? 'a ajouté un créneau à' : 'a retiré un créneau de'}
	{@render snippetRef(log.data.team)}
</p>

<div class="flex items-center flex-wrap gap-2 mt-1 text-base-content/70">
	{@render snippetPeriod(log.data.period, timezone)}
	<span class="badge badge-ghost badge-sm">
		{log.data.period.maxSubscribe}
		{log.data.period.maxSubscribe > 1 ? 'places' : 'place'}
	</span>
</div>
