<script lang="ts">
	import type { ComponentType, SvelteComponent } from 'svelte'
	import { Calendar, IdCard, CircleDollarSign } from 'lucide-svelte'
	import { derived, type Readable } from 'svelte/store'
	import { page } from '$app/stores'
	import { Card } from 'fuma'
	import type { User } from '@prisma/client'

	export let user: User

	type Tab = {
		href: string
		label: string
		icon: ComponentType<SvelteComponent>
		isActive?: boolean
	}

	const tabs: Readable<Tab[]> = derived(page, (_page) => {
		const routeId = _page.route.id
		const tabs: Tab[] = [
			{
				href: '/me/events',
				label: 'Mes évènements',
				icon: Calendar,
				isActive: routeId?.startsWith('/(home)/me/events') || routeId?.startsWith('/[eventId]'),
			},
			{
				href: '/me/account',
				label: 'Mon compte',
				icon: IdCard,
			},
		]

		if (user.isOrganizer)
			tabs.push({
				href: '/me/checkouts',
				label: 'Mes achats',
				icon: CircleDollarSign,
			})

		return tabs
	})
</script>

<Card class="max-w-2xl mx-auto">
	<svelte:fragment slot="top">
		<div
			class="
				bordered sticky top-0 z-20 flex gap-2 rounded-t-2xl border-b bg-base-100 p-2 shadow-sm
			"
		>
			{#each $tabs as { href, isActive, label, icon: Icon }}
				{@const active = isActive ?? $page.url.pathname.startsWith(href)}
				<a
					{href}
					data-sveltekit-noscroll
					class="
						menu-item grow flex-col justify-center gap-0 rounded-lg py-2
						text-sm lg:flex-row lg:gap-3 lg:text-base
					"
					class:active
				>
					<Icon size={20} class="opacity-70" />
					<span class="hidden whitespace-nowrap sm:block">{label}</span>
				</a>
			{/each}
		</div>
	</svelte:fragment>
	<slot />
</Card>
