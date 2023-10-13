<script lang="ts">
	import type { LayoutData } from './$types'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import { Icon } from '$lib/material'
	import {
		mdiMenu,
		mdiChartGantt,
		mdiFileDocumentMultipleOutline,
		mdiAccountMultipleOutline,
		mdiClipboardTextMultipleOutline,
		mdiCogs,
	} from '@mdi/js'
	import DropDown from '$lib/material/DropDown.svelte'
	import PubliqueMenuItems from './PubliqueMenuItems.svelte'
	export let pageIndex: LayoutData['pageIndex']
	export let pages: LayoutData['pages']
	export let isOwner: boolean
	export let isLeaderInEvent: boolean

	const adminPages = [
		{
			path: '/admin/manage/members',
			label: 'Membres',
			icon: mdiAccountMultipleOutline,
		},
		{
			path: '/admin/manage/subscribes',
			label: 'Inscriptions',
			icon: mdiClipboardTextMultipleOutline,
		},
		{
			path: '/admin/plan',
			label: 'Planification',
			icon: mdiChartGantt,
		},
		{
			path: '/admin/config',
			label: 'Configuration',
			icon: mdiCogs,
		},
		{
			path: '/admin/pages',
			label: 'Les pages',
			icon: mdiFileDocumentMultipleOutline,
		},
	]
</script>

<div class="gap-2 hidden lg:flex">
	<PubliqueMenuItems {pages} {pageIndex} />
</div>

<DropDown class="max-h-none min-w-[200px]">
	<button
		slot="activator"
		class="
		btn btn-ghost btn-square
		{isOwner || isLeaderInEvent ? '' : 'lg:hidden'}
	"
	>
		<Icon path={mdiMenu} />
	</button>

	<div class="flex flex-col gap-1">
		<div class="contents lg:hidden">
			{#if isOwner || isLeaderInEvent}
				<h3 class=" font-bold opacity-50 pl-3 pt-1 text-xs">Public</h3>
			{/if}
			<PubliqueMenuItems {pages} {pageIndex} />
		</div>

		<!-- ADMIN -->
		{#if isOwner || isLeaderInEvent}
			<hr class="block lg:hidden" />
			<h3 class="font-bold opacity-50 pl-3 pt-1 text-xs">Gestion</h3>
			{#each adminPages as { path, label, icon }}
				{@const active = $page.route.id?.startsWith(`/[eventId]${path}`)}
				<a href="{$eventPath}{path}" class="menu-item" class:active>
					<Icon path={icon} size={20} class="opacity-70" {active} />
					{label}
				</a>
			{/each}
		{/if}
	</div>
</DropDown>
