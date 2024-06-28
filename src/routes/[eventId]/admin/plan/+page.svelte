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
</script>

<PlanHeader teams={data.teams} bind:hourSize />

<div class="h-[80vh] overflow-hidden rounded-2xl">
	{#if $urlParam.hasValue('view', 'v')}
		<PlanV teams={data.teams_periods} {range} {hourSize} />
	{:else}
		<PlanH teams={data.teams_periods} {range} {hourSize} />
	{/if}
</div>
