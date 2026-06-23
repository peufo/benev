<script lang="ts">
	import { urlParam } from 'fuma'
	import { PlanV, PlanH } from '$lib/plan'
	import PlanHeader from '$lib/plan/PlanHeader.svelte'
	import DrawersForm from '$lib/DrawersForm.svelte'
	import { daytz } from '$lib/dayjs.js'
	import { afterNavigate } from '$app/navigation'
	import { scrollToActive } from '$lib/plan/scrollToActive.js'

	export let data

	let hourSize = +($urlParam.get('hourSize') || 80)
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

	$: cursor = daytz(data.cursor)

	afterNavigate(async (navigation) => {
		await navigation.complete
		scrollToActive()
	})
</script>

<div
	class="px-2 pt-2 fixed right-0 transition-transform {isMouseOnTop
		? 'translate-y-0'
		: '-translate-y-full'}"
	style:z-index={100}
>
	<PlanHeader
		teams={data.teams}
		views={data.views}
		{cursor}
		bind:hourSize
		isFullscreen
		class="border-2 rounded-2xl"
	/>
</div>

<div class="h-[100vh] overflow-hidden rounded-2xl" use:mouseOnTop>
	{#if $urlParam.hasValue('view', 'v')}
		<PlanV teams={data.teams_periods} range={data.range} {cursor} {hourSize} />
	{:else}
		<PlanH teams={data.teams_periods} range={data.range} {cursor} {hourSize} />
	{/if}
</div>

<DrawersForm event={data.member.event} team={data.team} period={data.period || {}} />
