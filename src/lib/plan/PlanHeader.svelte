<script lang="ts">
	import { InputCheckboxsMenu, TabsIcon } from '$lib/fuma-legacy'
	import TableViewSelect from '$lib/view/TableViewSelect.svelte'
	import { tip, urlParam } from 'fuma'
	import { page } from '$app/stores'
	import { PeriodCardOptions } from './cardContent'
	import { eventPath } from '$lib/store'
	import PlanCursor from './PlanCursor.svelte'
	import type { Plan } from './types'
	import {
		AlignLeftIcon,
		Columns3Icon,
		ExternalLinkIcon,
		ZoomInIcon,
		ZoomOutIcon,
	} from '@lucide/svelte'

	interface Props {
		teams: { id: string; name: string }[]
		views: { id: string; name: string; query: string }[]
		isFullscreen?: boolean
		plan: Plan
		class?: string
	}

	let { teams, views, isFullscreen = false, plan, class: klass = '' }: Props = $props()
</script>

<div class="flex gap-2 items-center p-2 bg-base-100 {klass}" style="--btn-text-case: none;">
	{#if !isFullscreen}
		<h2 class="title px-2">Planification</h2>
		<div class="grow"></div>
	{/if}

	<TableViewSelect key="plan" {views} />

	{#key $page.url.searchParams}
		<InputCheckboxsMenu
			key="teams"
			options={teams.map((t) => ({ value: t.id, label: t.name }))}
			enhanceDisabled
			badgePrimary
		>
			{#snippet labelSnippet()}
				<span class="font-normal">secteurs</span>
			{/snippet}
		</InputCheckboxsMenu>
	{/key}

	<PlanCursor cursor={plan.cursor} />
	<div class="join">
		<a
			class="btn btn-sm btn-square join-item"
			href={urlParam.with({ hourSize: Math.max(5, plan.hourSize * 0.85) })}
			data-sveltekit-replacestate
		>
			<ZoomOutIcon size={18} opacity={0.8} />
		</a>
		<a
			class="btn btn-sm btn-square join-item"
			href={urlParam.with({ hourSize: Math.min(100, plan.hourSize * 1.15) })}
			data-sveltekit-replacestate
		>
			<ZoomInIcon size={18} opacity={0.8} />
		</a>
	</div>

	<PeriodCardOptions />

	<TabsIcon
		key="axis"
		defaultValue="x"
		options={[
			{ label: 'Vue horizontal', icon: AlignLeftIcon, value: 'x' },
			{ label: 'Vue vertical', icon: Columns3Icon, value: 'y' },
		]}
	/>

	<a
		href="{$eventPath}/admin/plan{isFullscreen ? '' : '/fullscreen'}{$page.url.search}"
		class="btn btn-square btn-sm"
	>
		<span class="inline-flex" use:tip={{ content: 'Ouvrir en plein écran' }}
			><ExternalLinkIcon class="opacity-80 {isFullscreen ? 'rotate-180' : ''}" /></span
		>
	</a>
</div>

<style>
	:root {
		print-color-adjust: exact;
	}
</style>
