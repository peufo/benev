<script lang="ts">
	import type { Page } from '@prisma/client'
	import { page } from '$app/stores'
	import { DropDown } from 'fuma'
	import { Menu, Gauge } from 'lucide-svelte'
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
		<Menu size={24} />
	</button>

	<div class="flex flex-col gap-1">
		{#if adminIsVisible}
			<h3 class="title-sm pl-3 pt-1">Public</h3>
		{/if}
		<EventPubliqueMenuItems {pages} hideTeams={adminIsVisible} />

		<!-- ADMIN -->
		{#if adminIsVisible}
			<hr class="block lg:hidden" />
			<h3 class="title-sm pl-3 pt-1">Gestion</h3>
			{#each $adminTabs as { href, isActive, label, icon: Icon }}
				<a {href} class="menu-item" class:active={isActive}>
					<Icon size={20} class="opacity-70" />
					{label}
				</a>
			{/each}

			{@const quotaHref = `/${$page.params.eventId}/admin/quota`}
			<a
				href={quotaHref}
				class="menu-item"
				class:active={$page.route.id?.startsWith('/[eventId]/admin/quota')}
			>
				<Gauge size={20} class="opacity-70" />
				Quota
			</a>
		{/if}
	</div>
</DropDown>
