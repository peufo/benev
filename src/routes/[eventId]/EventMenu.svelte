<script lang="ts">
	import type { Page } from '@prisma/client'
	import { page } from '$app/state'
	import { DropDown } from 'fuma'
	import { MenuIcon, GaugeIcon } from '@lucide/svelte'
	import { EventPubliqueMenuItems } from '$lib/event'
	import { adminTabs } from '$lib/layout/adminTabs.svelte'

	interface Props {
		pages: Pick<Page, 'id' | 'title' | 'type' | 'path'>[]
	}

	let { pages }: Props = $props()

	let adminIsVisible = $derived(page.data.member?.roles.includes('leader') || page.data.userIsRoot)
</script>

<div class="gap-2 hidden lg:flex">
	<EventPubliqueMenuItems {pages} class="btn btn-ghost" classActive="btn-active" />
</div>

<DropDown class="max-h-none min-w-50" hideOnBlur>
	{#snippet activator()}
		<button
			class="
				btn btn-square ml-2 lg:hidden
			"
		>
			<MenuIcon size={24} />
		</button>
	{/snippet}

	<div class="flex flex-col gap-1">
		{#if adminIsVisible}
			<h3 class="title-sm pl-3 pt-1">Public</h3>
		{/if}
		<EventPubliqueMenuItems
			{pages}
			hideTeams={adminIsVisible}
			class="menu-item"
			classActive="active"
		/>

		<!-- ADMIN -->
		{#if adminIsVisible}
			<hr class="block lg:hidden" />
			<h3 class="title-sm pl-3 pt-1">Gestion</h3>
			{#each adminTabs() as { href, isActive, label, icon: Icon } (href)}
				<a {href} class="menu-item" class:active={isActive}>
					<Icon size={20} class="opacity-70" />
					{label}
				</a>
			{/each}

			{@const quotaHref = `/${page.params.eventId}/admin/quota`}
			<a
				href={quotaHref}
				class="menu-item"
				class:active={page.route.id?.startsWith('/[eventId]/admin/quota')}
			>
				<GaugeIcon size={20} class="opacity-70" />
				Quota
			</a>
		{/if}
	</div>
</DropDown>
