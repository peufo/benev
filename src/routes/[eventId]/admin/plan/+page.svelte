<script lang="ts">
	import { jsonParse, RangePickerButton, urlParam, TabsIcon, Icon } from 'fuma'
	import { mdiAlignHorizontalLeft, mdiAlignVerticalTop, mdiOpenInNew } from '@mdi/js'
	import { page } from '$app/stores'
	import { PlanV, PlanH, ZoomButton } from '$lib/plan'
	import { eventPath } from '$lib/store'

	export let data

	let hourSize = +($urlParam.get('hourSize') || 80)
	let range = data.rangeOfEvent
	urlParam.subscribe(({ get }) => {
		range = jsonParse(get('range'), data.rangeOfEvent)
	})
</script>

<div class="flex gap-2 items-center p-2 bg-base-100 rounded-2xl" style="--btn-text-case: none;">
	<h2 class="title">Planification</h2>
	<div class="grow" />

	<RangePickerButton />

	<ZoomButton bind:value={hourSize} min={5} max={100} step={1} />

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
		<PlanV teams={data.teams_periods} {range} {hourSize} />
	{:else}
		<PlanH teams={data.teams_periods} {range} {hourSize} />
	{/if}
</div>
