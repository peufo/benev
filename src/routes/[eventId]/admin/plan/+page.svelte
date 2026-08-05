<script lang="ts">
	import { urlParam } from 'fuma'
	import { PlanX, PlanY } from '$lib/plan'
	import PlanHeader from '$lib/plan/PlanHeader.svelte'
	import { MilestoneDrawer } from '$lib/milestone'
	import { getPlan } from '$lib/plan/getPlan.js'

	let { data } = $props()
	let plan = $derived(getPlan(data))

	let teams = $derived(data.teams_periods)
</script>

<div
	style="height: calc(100vh - 96px)"
	class="overflow-hidden rounded-2xl border footer-hidden flex flex-col"
>
	<PlanHeader {plan} teams={data.teams} views={data.views} class="border-b" />
	{#if urlParam.has('axis', 'y')}
		<PlanY {plan} bind:teams />
	{:else}
		<PlanX {plan} bind:teams />
	{/if}

	<MilestoneDrawer milestone={data.milestone} />
</div>
