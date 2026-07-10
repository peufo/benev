<script lang="ts">
	import { urlParam } from 'fuma'
	import { PlanX, PlanY } from '$lib/plan'
	import PlanHeader from '$lib/plan/PlanHeader.svelte'
	import DrawersForm from '$lib/DrawersForm.svelte'
	import { MilestoneDrawer } from '$lib/milestone'
	import { getPlan } from '$lib/plan/getPlan.js'

	export let data
	$: plan = getPlan(data)

	let isMouseOnTop = false

	function mouseOnTop(node: HTMLElement) {
		function onMouseMove(event: MouseEvent) {
			isMouseOnTop = event.clientY < 70
		}
		node.addEventListener('mousemove', onMouseMove)
		return {
			destroy: () => {
				node.removeEventListener('mousemove', onMouseMove)
			},
		}
	}
</script>

<div
	class="px-2 pt-2 fixed right-0 transition-transform {isMouseOnTop
		? 'translate-y-0'
		: '-translate-y-full'}"
	style:z-index={100}
>
	<PlanHeader
		{plan}
		teams={data.teams}
		views={data.views}
		isFullscreen
		class="border-2 rounded-2xl"
	/>
</div>

<div class="h-[100vh] overflow-hidden rounded-2xl" use:mouseOnTop>
	{#if $urlParam.hasValue('axis', 'y')}
		<PlanY {plan} bind:teams={data.teams_periods} />
	{:else}
		<PlanX {plan} bind:teams={data.teams_periods} />
	{/if}
</div>

<DrawersForm event={data.member.event} team={data.team} period={data.period || {}} />

<MilestoneDrawer milestone={data.milestone} />
