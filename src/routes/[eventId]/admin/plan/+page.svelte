<script lang="ts">
	import { urlParam } from 'fuma'
	import { PlanV, PlanH } from '$lib/plan'
	import PlanHeader from '$lib/plan/PlanHeader.svelte'
	import { daytz } from '$lib/dayjs.js'

	export let data
	let hourSize = +($urlParam.get('hourSize') || 80)
</script>

<div
	style="height: calc(100vh - 96px)"
	class="overflow-hidden rounded-2xl border footer-hidden flex flex-col"
>
	<PlanHeader
		teams={data.teams}
		views={data.views}
		cursor={daytz(data.cursor)}
		bind:hourSize
		class="border-b"
	/>
	{#if $urlParam.hasValue('view', 'v')}
		<PlanV bind:teams={data.teams_periods} range={data.range} {hourSize} />
	{:else}
		<PlanH bind:teams={data.teams_periods} range={data.range} {hourSize} />
	{/if}
</div>
