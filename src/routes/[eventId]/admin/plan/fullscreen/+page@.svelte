<script lang="ts">
	import { jsonParse, urlParam } from 'fuma'
	import { PlanV, PlanH } from '$lib/plan'
	import PlanHeader from '$lib/plan/PlanHeader.svelte'

	export let data

	let hourSize = +($urlParam.get('hourSize') || 80)
	let range = data.rangeOfEvent
	urlParam.subscribe(({ get }) => {
		range = jsonParse(get('range'), data.rangeOfEvent)
	})

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
	<PlanHeader teams={data.teams} bind:hourSize isFullscreen class="border-2" />
</div>

<div class="h-[100vh] overflow-hidden rounded-2xl" use:mouseOnTop>
	{#if $urlParam.hasValue('view', 'v')}
		<PlanV teams={data.teams_periods} {range} {hourSize} />
	{:else}
		<PlanH teams={data.teams_periods} {range} {hourSize} />
	{/if}
</div>
