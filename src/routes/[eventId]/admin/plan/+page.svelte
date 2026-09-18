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

<div class="flex flex-col gap-3 h-main">
	<PlanHeader bind:plan teams={data.teams} views={data.views} />

	<div class={['overflow-hidden flex flex-col rounded-box border border-soft grow']}>
		{#if urlParam.has('axis', 'y')}
			<PlanY bind:plan bind:teams />
		{:else}
			<PlanX bind:plan bind:teams />
		{/if}

		<MilestoneDrawer milestone={data.milestone} />
	</div>
</div>
