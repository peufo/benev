<script lang="ts">
	import type { LayoutData } from './$types'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import { Icon } from '$lib/material'
	import {
		mdiFileDocumentOutline,
		mdiHomeOutline,
		mdiMapMarkerRadiusOutline,
		mdiMenu,
		mdiChartGantt,
		mdiFileDocumentMultipleOutline,
		mdiAccountMultipleOutline,
		mdiClipboardTextMultipleOutline,
		mdiCogs,
	} from '@mdi/js'
	import DropDown from '$lib/material/DropDown.svelte'
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

<DropDown class="max-h-none">
	<button slot="activator" class="btn btn-ghost btn-square">
		<Icon path={mdiMenu} />
	</button>

	<div class="flex flex-col gap-1">
		{#if isOwner || isLeaderInEvent}
			<h3 class=" font-bold opacity-50 pl-3 pt-1 text-xs">Publique</h3>
		{/if}

		<!-- HOME -->
		<a href={$eventPath} class="menu-item" class:active={$page.route.id == '/[eventId]'}>
			<Icon
				path={mdiHomeOutline}
				size={20}
				class="opacity-70"
				active={$page.route.id == '/[eventId]'}
			/>
			{pageIndex.title}
		</a>

		<!-- TEAMS -->
		<a
			href="{$eventPath}/teams"
			class="menu-item"
			class:active={$page.route.id?.startsWith('/[eventId]/teams')}
		>
			<Icon
				path={mdiMapMarkerRadiusOutline}
				size={20}
				class="opacity-70"
				active={$page.route.id?.startsWith('/[eventId]/teams')}
			/>
			Secteurs
		</a>

		<!-- PAGES -->
		{#each pages as { title, path, id, isIndex } (id)}
			{@const href = `${$eventPath}${isIndex ? '' : `/${path}`}`}
			<a {href} class="menu-item" class:active={$page.url.pathname == href}>
				<Icon
					path={mdiFileDocumentOutline}
					size={20}
					class="opacity-70"
					active={$page.url.pathname == href}
				/>
				{title}
			</a>
		{/each}

		<!-- ADMIN -->
		<hr />
		<h3 class=" font-bold opacity-50 pl-3 pt-1 text-xs">Gestion</h3>
		{#if isOwner || isLeaderInEvent}
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
