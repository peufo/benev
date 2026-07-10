<script lang="ts">
	import { mdiAlignHorizontalLeft, mdiAlignVerticalTop, mdiOpenInNew } from '@mdi/js'
	import { Icon, InputCheckboxsMenu, TableViewSelect, TabsIcon, urlParam } from 'fuma'
	import { page } from '$app/stores'
	import { PeriodCardOptions } from './cardContent'
	import ZoomButton from './ZoomButton.svelte'
	import { eventPath } from '$lib/store'
	import PlanCursor from './PlanCursor.svelte'
	import type { Plan } from './types'
	import { ZoomInIcon, ZoomOutIcon } from 'lucide-svelte'

	export let teams: { id: string; name: string }[]
	export let views: { id: string; name: string; query: string }[]
	export let isFullscreen = false
	export let plan: Plan
	let klass = ''
	export { klass as class }
</script>

<div class="flex gap-2 items-center p-2 bg-base-100 {klass}" style="--btn-text-case: none;">
	{#if !isFullscreen}
		<h2 class="title px-2">Planification</h2>
		<div class="grow" />
	{/if}

	<TableViewSelect key="plan" {views} action="{$eventPath}/admin" />

	{#key $page.url.searchParams}
		<InputCheckboxsMenu
			key="teams"
			options={teams.map((t) => ({ value: t.id, label: t.name }))}
			enhanceDisabled
			badgePrimary
		>
			<span slot="label" class="font-normal">secteurs</span>
		</InputCheckboxsMenu>
	{/key}

	<PlanCursor cursor={plan.cursor} />
	<div class="join">
		<a
			class="btn btn-sm btn-square join-item"
			href={$urlParam.with({ hourSize: Math.max(5, plan.hourSize * 0.85) })}
			data-sveltekit-replacestate
		>
			<ZoomOutIcon size={18} opacity={0.8} />
		</a>
		<a
			class="btn btn-sm btn-square join-item"
			href={$urlParam.with({ hourSize: Math.min(100, plan.hourSize * 1.15) })}
		>
			<ZoomInIcon size={18} opacity={0.8} />
		</a>
	</div>

	<PeriodCardOptions />

	<TabsIcon
		key="axis"
		defaultValue="x"
		options={[
			{ label: 'Vue horizontal', icon: mdiAlignHorizontalLeft, value: 'x' },
			{ label: 'Vue vertical', icon: mdiAlignVerticalTop, value: 'y' },
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
