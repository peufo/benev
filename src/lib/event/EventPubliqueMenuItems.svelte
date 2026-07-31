<script lang="ts">
	import { HouseIcon, MapPinnedIcon } from '@lucide/svelte'
	import type { Page } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import { PAGE_TYPE } from '$lib/constant'

	interface Props {
		pages: Pick<Page, 'id' | 'title' | 'type' | 'path'>[]
		hideIndex?: boolean
		hideTeams?: boolean
		classItem?: string
	}

	let { pages, hideIndex = false, hideTeams = false, classItem = '' }: Props = $props()

	let pageHome = $derived(pages.find((p) => p.type === 'home'))
	let isMember = $derived(!!$page.data.member)
</script>

<!-- HOME -->
{#if !hideIndex && pageHome}
	<a href={$eventPath} class="menu-item {classItem}" class:active={$page.route.id == '/[eventId]'}>
		<HouseIcon size={20} class="opacity-70" />
		{pageHome.title}
	</a>
{/if}

<!-- TEAMS -->
{#if !hideTeams && $page.data.event?.selfSubscribeAllowed}
	<a
		href="{$eventPath}/teams"
		class="menu-item {classItem}"
		class:active={$page.route.id?.startsWith('/[eventId]/teams')}
	>
		<MapPinnedIcon size={20} class="opacity-70" />
		Secteurs
	</a>
{/if}

<!-- PAGES -->
{#each pages.filter((p) => p.type !== 'home' && (isMember || p.type !== 'member')) as { title, path, id, type } (id)}
	{@const href = `${$eventPath}/${path}`}
	{@const PageIcon = PAGE_TYPE[type].icon}
	<a {href} class="menu-item {classItem}" class:active={$page.url.pathname == href}>
		<PageIcon size={20} class="opacity-70" />
		{title}
	</a>
{/each}
