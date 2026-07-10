<script lang="ts">
	import { urlParam } from 'fuma'
	import { PlanX, PlanY } from '$lib/plan'
	import PlanHeader from '$lib/plan/PlanHeader.svelte'
	import { MilestoneDrawer } from '$lib/milestone'
	import { getPlan } from '$lib/plan/getPlan.js'

	export let data
	$: plan = getPlan(data)
</script>

<div
	style="height: calc(100vh - 96px)"
	class="overflow-hidden rounded-2xl border footer-hidden flex flex-col"
>
	<PlanHeader {plan} teams={data.teams} views={data.views} class="border-b" />
	{#if $urlParam.hasValue('axis', 'y')}
		<PlanY {plan} bind:teams={data.teams_periods} />
	{:else}
		<PlanX {plan} bind:teams={data.teams_periods} />
	{/if}

	<MilestoneDrawer milestone={data.milestone} />
</div>
