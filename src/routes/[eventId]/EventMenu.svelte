<script lang="ts">
	import type { Page } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import { Icon } from '$lib/material'
	import { mdiHelp, mdiMenu } from '@mdi/js'
	import DropDown from '$lib/material/DropDown.svelte'
	import { EventPubliqueMenuItems } from '$lib/event'
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
			btn btn-square ml-2
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
			{#each $adminTabs as { href, isActive, label, icon }}
				<a {href} class="menu-item" class:active={isActive}>
					<Icon path={icon} size={20} class="opacity-70" />
					{label}
				</a>
			{/each}

			<a
				href="{$eventPath}/help"
				class="menu-item"
				class:active={$page.route.id === '/[eventId]/help'}
			>
				<Icon
					path={mdiHelp}
					size={20}
					class="opacity-70"
					active={$page.route.id === '/[eventId]/help'}
				/>
				Aide
			</a>
		{/if}
	</div>
</DropDown>
