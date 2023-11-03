<script lang="ts">
	import { Page } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import { Icon } from '$lib/material'
	import { mdiMenu } from '@mdi/js'
	import DropDown from '$lib/material/DropDown.svelte'
	import EventPubliqueMenuItems from '$lib/EventPubliqueMenuItems.svelte'
	import { adminTabs } from './admin/adminTabs'

	export let pages: Pick<Page, 'id' | 'title' | 'isIndex' | 'path'>[]

	$: adminIsVisible = $page.data.member?.roles.includes('leader')
</script>

<div class="gap-2 hidden lg:flex">
	<EventPubliqueMenuItems {pages} />
</div>

<DropDown class="max-h-none min-w-[200px]" hideOnBlur>
	<button
		slot="activator"
		class="
			btn btn-ghost btn-square
			{adminIsVisible ? '' : 'lg:hidden'}
		"
	>
		<Icon path={mdiMenu} />
	</button>

	<div class="flex flex-col gap-1">
		<div class="contents lg:hidden">
			{#if adminIsVisible}
				<h3 class=" font-bold opacity-50 pl-3 pt-1 text-xs">Public</h3>
			{/if}
			<EventPubliqueMenuItems {pages} />
		</div>

		<!-- ADMIN -->
		{#if adminIsVisible}
			<hr class="block lg:hidden" />
			<h3 class="font-bold opacity-50 pl-3 pt-1 text-xs">Gestion</h3>
			{#each $adminTabs as { path, label, icon }}
				{@const active = $page.route.id?.startsWith(`/[eventId]${path}`)}
				<a href="{$eventPath}{path}" class="menu-item" class:active>
					<Icon path={icon} size={20} class="opacity-70" {active} />
					{label}
				</a>
			{/each}
		{/if}
	</div>
</DropDown>
