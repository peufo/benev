<script lang="ts">
	import type { LayoutData } from './$types'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import { Icon } from '$lib/material'
	import { mdiFileDocumentOutline, mdiHomeOutline, mdiMapMarkerRadiusOutline } from '@mdi/js'
	export let pageIndex: LayoutData['pageIndex']
	export let pages: LayoutData['pages']
</script>

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
