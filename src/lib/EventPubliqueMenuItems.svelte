<script lang="ts">
	import type { Page } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import { Icon } from '$lib/material'
	import { mdiFileDocumentOutline, mdiHomeOutline, mdiMapMarkerRadiusOutline } from '@mdi/js'
	export let pages: Pick<Page, 'id' | 'title' | 'isIndex' | 'path'>[]

	export let hideIndex = false

	$: pageIndex = pages.find((p) => p.isIndex)
</script>

<!-- HOME -->
{#if !hideIndex && pageIndex}
	<a href={$eventPath} class="menu-item" class:active={$page.route.id == '/[eventId]'}>
		<Icon
			path={mdiHomeOutline}
			size={20}
			class="opacity-70"
			active={$page.route.id == '/[eventId]'}
		/>
		{pageIndex.title}
	</a>
{/if}

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
{#each pages.filter((p) => !p.isIndex) as { title, path, id, isIndex } (id)}
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
