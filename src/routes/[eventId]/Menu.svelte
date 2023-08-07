<script lang="ts">
	import type { LayoutData } from './$types'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import { Icon } from '$lib/material'
	import { mdiMenu } from '@mdi/js'
	export let pages: LayoutData['pages']
	export let isOwner: boolean
</script>

<ul class="tabs hidden lg:block">
  {#if isOwner}
    <a
      href="{$eventPath}/edit"
      class="tab"
      class:tab-active={$page.url.pathname.startsWith(`${$eventPath}/edit`)}
    >
      Edition
    </a>
  {/if}

	<a
		href="{$eventPath}/teams"
		class="tab"
		class:tab-active={$page.url.pathname.startsWith(`${$eventPath}/teams`)}
	>
		Équipes
	</a>

	{#each pages as { title, path, id, isIndex } (id)}
		{@const href = `${$eventPath}${isIndex ? '' : `/${path}`}`}
		<a class="tab" {href} class:tab-active={$page.url.pathname == href}>
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
				Edition
			</a>
		</li>
    {/if}

		<li>
			<a
				href="{$eventPath}/teams"
				class:active={$page.url.pathname.startsWith(`${$eventPath}/teams`)}
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
