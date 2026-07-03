<script lang="ts">
	import { urlParam } from 'fuma'
	import { PlanV, PlanH } from '$lib/plan'
	import PlanHeader from '$lib/plan/PlanHeader.svelte'
	import { MilestoneDrawer } from '$lib/milestone'
	import { daytz } from '$lib/dayjs.js'
	import { afterNavigate } from '$app/navigation'
	import { scrollToActive } from '$lib/plan/scrollToActive.js'

	export let data
	let hourSize = +($urlParam.get('hourSize') || 20)

	$: cursor = daytz(data.cursor)

	afterNavigate(async (navigation) => {
		await navigation.complete
		scrollToActive()
	})
</script>

<div
	style="height: calc(100vh - 96px)"
	class="overflow-hidden rounded-2xl border footer-hidden flex flex-col"
>
	<PlanHeader teams={data.teams} views={data.views} {cursor} bind:hourSize class="border-b" />
	{#if $urlParam.hasValue('view', 'v')}
		<PlanV bind:teams={data.teams_periods} range={data.range} {cursor} {hourSize} />
	{:else}
		<PlanH
			bind:teams={data.teams_periods}
			milestones={data.milestones}
			range={data.range}
			{cursor}
			{hourSize}
		/>
	{/if}

	<MilestoneDrawer milestone={data.milestone} />
</div>
