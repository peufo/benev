<script lang="ts">
	import { HouseIcon, MapPinnedIcon } from '@lucide/svelte'
	import type { Page } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import { page } from '$app/state'
	import { PAGE_TYPE } from '$lib/constant'
	import type { ClassValue } from 'svelte/elements'

	interface Props {
		pages: Pick<Page, 'id' | 'title' | 'type' | 'path'>[]
		hideIndex?: boolean
		hideTeams?: boolean
		class?: ClassValue
		classActive?: ClassValue
	}

	let { pages, hideIndex = false, hideTeams = false, class: klass, classActive }: Props = $props()

	let pageHome = $derived(pages.find((p) => p.type === 'home'))
	let isMember = $derived(!!page.data.member)
</script>

<!-- HOME -->
{#if !hideIndex && pageHome}
	<a href={$eventPath} class={[klass, page.route.id === '/[eventId]' && classActive]}>
		<HouseIcon size={20} class="opacity-70" />
		{pageHome.title}
	</a>
{/if}

<!-- TEAMS -->
{#if !hideTeams && page.data.event?.selfSubscribeAllowed}
	<a
		href="{$eventPath}/teams"
		class={[klass, page.route.id?.startsWith('/[eventId]/teams') && classActive]}
	>
		<MapPinnedIcon size={20} class="opacity-70" />
		Secteurs
	</a>
{/if}

<!-- PAGES -->
{#each pages.filter((p) => p.type !== 'home' && (isMember || p.type !== 'member')) as { title, path, id, type } (id)}
	{@const href = `${$eventPath}/${path}`}
	{@const PageIcon = PAGE_TYPE[type].icon}
	<a {href} class={[klass, page.url.pathname === href && classActive]}>
		<PageIcon size={20} class="opacity-70" />
		{title}
	</a>
{/each}
