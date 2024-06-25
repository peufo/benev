<script lang="ts">
	import { jsonParse, RangePickerButton, urlParam, TabsIcon } from 'fuma'
	import { mdiChartTimeline, mdiChartWaterfall } from '@mdi/js'
	import { PlanV, PlanH } from '$lib/plan/index.js'

	export let data

	const MS_TO_HOUR = 3_600_000

	let msSize = 40 / MS_TO_HOUR
	let range = data.rangeOfEvent
	urlParam.subscribe(({ get }) => {
		range = jsonParse(get('range'), data.rangeOfEvent)
	})
</script>

<div class="flex gap-2 p-2 bg-base-100 rounded-2xl">
	<h2 class="title">Planification</h2>
	<RangePickerButton bind:range />

	<TabsIcon
		key="view"
		defaultValue="h"
		options={[
			{ label: 'Vue horizontal', icon: mdiChartTimeline, value: 'h' },
			{ label: 'Vue vertical', icon: mdiChartWaterfall, value: 'v' },
		]}
	/>
</div>

<div class="h-[80vh] overflow-hidden rounded-2xl">
	{#if $urlParam.hasValue('view', 'v')}
		<PlanV teams={data.teams_periods} {range} {msSize} />
	{:else}
		<PlanH teams={data.teams_periods} {range} {msSize} />
	{/if}
</div>
