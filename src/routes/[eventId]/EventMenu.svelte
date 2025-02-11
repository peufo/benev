<script lang="ts">
	import type { Page } from '@prisma/client'
	import { page } from '$app/stores'
	import { Icon, DropDown } from 'fuma'
	import { mdiMenu } from '@mdi/js'
	import { EventPubliqueMenuItems } from '$lib/event'
	import { adminTabs } from '$lib/layout/adminTabs'

	export let pages: Pick<Page, 'id' | 'title' | 'type' | 'path'>[]

	$: adminIsVisible = $page.data.member?.roles.includes('leader') || $page.data.userIsRoot
</script>

<div class="gap-2 hidden lg:flex">
	<EventPubliqueMenuItems {pages} />
</div>

<DropDown class="max-h-none min-w-[200px]" hideOnBlur>
	<button
		slot="activator"
		class="
			btn btn-square ml-2 lg:hidden
		"
	>
		<Icon path={mdiMenu} />
	</button>

	<div class="flex flex-col gap-1">
		{#if adminIsVisible}
			<h3 class="title-sm pl-3 pt-1">Public</h3>
		{/if}
		<EventPubliqueMenuItems {pages} />

		<!-- ADMIN -->
		{#if adminIsVisible}
			<hr class="block lg:hidden" />
			<h3 class="title-sm pl-3 pt-1">Gestion</h3>
			{#each $adminTabs as { href, isActive, label, icon }}
				<a {href} class="menu-item" class:active={isActive}>
					<Icon path={icon} size={20} class="opacity-70" />
					{label}
				</a>
			{/each}
		{/if}
	</div>
</DropDown>
