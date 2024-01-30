<script lang="ts">
	import type { Page } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import { Icon } from '$lib/material'
	import { mdiHomeOutline, mdiMapMarkerRadiusOutline } from '@mdi/js'
	import { PAGE_TYPE } from '$lib/constant'

	export let pages: Pick<Page, 'id' | 'title' | 'type' | 'path'>[]
	export let hideIndex = false
	export let classItem = ''

	$: pageHome = pages.find((p) => p.type === 'home')
	$: isMember = !!$page.data.member
</script>

<!-- HOME -->
{#if !hideIndex && pageHome}
	<a href={$eventPath} class="menu-item {classItem}" class:active={$page.route.id == '/[eventId]'}>
		<Icon path={mdiHomeOutline} size={20} class="opacity-70" />
		{pageHome.title}
	</a>
{/if}

<!-- TEAMS -->
{#if $page.data.event?.selfSubscribeAllowed || $page.data.member?.roles.includes('leader')}
	<a
		href="{$eventPath}/teams"
		class="menu-item {classItem}"
		class:active={$page.route.id?.startsWith('/[eventId]/teams')}
	>
		<Icon path={mdiMapMarkerRadiusOutline} size={20} class="opacity-70" />
		Secteurs
	</a>
{/if}

<!-- PAGES -->
{#each pages.filter((p) => p.type !== 'home' && (isMember || p.type !== 'member')) as { title, path, id, type } (id)}
	{@const href = `${$eventPath}/${path}`}
	<a {href} class="menu-item {classItem}" class:active={$page.url.pathname == href}>
		<Icon path={PAGE_TYPE[type].icon} size={20} class="opacity-70" />
		{title}
	</a>
{/each}
