<script lang="ts">
	import { mdiAlignHorizontalLeft, mdiAlignVerticalTop, mdiOpenInNew } from '@mdi/js'
	import { Icon, InputCheckboxsMenu, RangePickerButton, TabsIcon } from 'fuma'
	import { page } from '$app/stores'
	import { PeriodCardOptions } from './cardContent'
	import ZoomButton from './ZoomButton.svelte'
	import { eventPath } from '$lib/store'

	export let teams: { id: string; name: string }[]
	export let hourSize: number
	export let isFullscreen = false
	let klass = ''
	export { klass as class }
</script>

<div
	class="flex gap-2 items-center p-2 bg-base-100 rounded-2xl {klass}"
	style="--btn-text-case: none;"
>
	{#if !isFullscreen}
		<h2 class="title px-2">Planification</h2>
		<div class="grow" />
	{/if}

	<InputCheckboxsMenu
		key="teams"
		options={teams.map((t) => ({ value: t.id, label: t.name }))}
		enhanceDisabled
		badgePrimary
	>
		<span slot="label" class="font-normal">secteurs</span>
	</InputCheckboxsMenu>

	<RangePickerButton />

	<PeriodCardOptions />

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
		href="{$eventPath}/admin/plan{isFullscreen ? '' : '/fullscreen'}{$page.url.search}"
		class="btn btn-square btn-sm"
	>
		<Icon
			path={mdiOpenInNew}
			title="Ouvrir en plein écran"
			class="opacity-80 {isFullscreen ? 'rotate-180' : ''}"
		/>
	</a>
</div>

<style>
	:root {
		print-color-adjust: exact;
	}
</style>
