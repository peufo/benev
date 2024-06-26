<script lang="ts">
	import { jsonParse, RangePickerButton, urlParam, TabsIcon, Icon } from 'fuma'
	import { mdiAlignHorizontalLeft, mdiAlignVerticalTop, mdiOpenInNew } from '@mdi/js'
	import { PlanV, PlanH } from '$lib/plan/index.js'
	import { eventPath } from '$lib/store/index.js'
	import { page } from '$app/stores'
	import ZoomButton from './ZoomButton.svelte'

	export let data

	const MS_TO_HOUR = 3_600_000

	let msSize = +($urlParam.get('msSize') || 80 / MS_TO_HOUR)

	let range = data.rangeOfEvent
	urlParam.subscribe(({ get }) => {
		range = jsonParse(get('range'), data.rangeOfEvent)
	})
</script>

<div class="flex gap-2 p-2 bg-base-100 rounded-2xl">
	<h2 class="title">Planification</h2>
	<div class="grow" />

	<RangePickerButton bind:range />

	<ZoomButton
		bind:value={msSize}
		min={5 / MS_TO_HOUR}
		max={100 / MS_TO_HOUR}
		step={1 / MS_TO_HOUR}
	/>

	<TabsIcon
		key="view"
		defaultValue="h"
		options={[
			{ label: 'Vue horizontal', icon: mdiAlignHorizontalLeft, value: 'h' },
			{ label: 'Vue vertical', icon: mdiAlignVerticalTop, value: 'v' },
		]}
	/>

	<a
		href="{$eventPath}/admin/plan/fullsceen{$page.url.search}"
		target="_blank"
		class="btn btn-square btn-sm"
	>
		<Icon path={mdiOpenInNew} title="Ouvrir en plein écran" />
	</a>
</div>

<div class="h-[80vh] overflow-hidden rounded-2xl">
	{#if $urlParam.hasValue('view', 'v')}
		<PlanV teams={data.teams_periods} {range} {msSize} />
	{:else if $urlParam.hasValue('view', 'h')}
		<PlanH teams={data.teams_periods} {range} {msSize} />
	{/if}
</div>
