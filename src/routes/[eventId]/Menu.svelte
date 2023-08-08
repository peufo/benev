<script lang="ts">
	import type { LayoutData } from './$types'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import { Icon } from '$lib/material'
	import { mdiCogOutline, mdiMenu } from '@mdi/js'
	export let pageIndex: LayoutData['pageIndex']
	export let pages: LayoutData['pages']
	export let isOwner: boolean
</script>

<ul class="tabs hidden lg:block">
	<a href={$eventPath} class="tab tab-bordered" class:tab-active={$page.route.id === '/[eventId]'}>
		{pageIndex.title}
	</a>
	<a
		href="{$eventPath}/teams"
		class="tab tab-bordered"
		class:tab-active={$page.route.id?.startsWith('/[eventId]/teams')}
	>
		Équipes
	</a>

	{#each pages as { title, path, id, isIndex } (id)}
		{@const href = `${$eventPath}${isIndex ? '' : `/${path}`}`}
		<a class="tab tab-bordered" {href} class:tab-active={$page.url.pathname == href}>
			{title}
		</a>
	{/each}
</ul>

<div class="dropdown dropdown-bottom dropdown-end lg:hidden">
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
	<label tabindex="0" class="btn btn-ghost m-1">
		<Icon path={mdiMenu} />
	</label>
	<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
	<ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
		{#if isOwner}
			<li>
				<a
					href="{$eventPath}/edit"
					class:active={$page.url.pathname.startsWith(`${$eventPath}/edit`)}
				>
					<Icon path={mdiCogOutline} class="rotate-12" />
					Gestion évenement
				</a>
			</li>
		{/if}


		<li>
			<a href={$eventPath} class:active={$page.route.id == '/[eventId]'}>
				{pageIndex.title}
			</a>
		</li>

		<li>
			<a
				href="{$eventPath}/teams"
				class:active={$page.route.id?.startsWith('/[eventId]/teams')}
			>
				Équipes
			</a>
		</li>

		{#each pages as { title, path, id, isIndex } (id)}
			{@const href = `${$eventPath}${isIndex ? '' : `/${path}`}`}
			<li>
				<a {href} class:active={$page.url.pathname == href}>
					{title}
				</a>
			</li>
		{/each}
	</ul>
</div>
