<script lang="ts">
	import type { Component } from 'svelte'
	import { Calendar, IdCard, CircleDollarSign, type IconProps } from '@lucide/svelte'
	import { page } from '$app/state'
	import { contextContainer } from '$lib/fuma-legacy/ui/context.js'
	import type { User } from '@prisma/client'

	interface Props {
		user: User
		children?: import('svelte').Snippet
	}

	let { user, children }: Props = $props()

	// Les enfants (formulaires, Login…) ne doivent pas remonter leur propre surface.
	contextContainer.set('card')

	type Tab = {
		href: string
		label: string
		icon: Component<IconProps>
		isActive?: boolean
	}

	const tabs: Tab[] = $derived.by(() => {
		const routeId = page.route.id
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

<div class="card mx-auto max-w-3xl border border-hard bg-base-100 shadow-lg">
	<nav
		aria-label="Espace personnel"
		class={['sticky top-0 flex gap-1 p-1 z-20', 'rounded-t-box border-b border-hard bg-base-100']}
	>
		{#each tabs as { href, isActive, label, icon: Icon } (href)}
			{@const _isActive = isActive ?? page.url.pathname.startsWith(href)}
			<a
				{href}
				data-sveltekit-noscroll
				aria-current={_isActive ? 'page' : undefined}
				class={[
					'btn btn-ghost grow',
					'max-sm:flex-col max-sm:h-12 max-sm:gap-0 max-sm:text-xs max-sm:px-1 max-sm:font-normal',
					_isActive && 'btn-active',
				]}
			>
				<Icon size={20} class="opacity-70 shrink-0" />
				<span class="whitespace-nowrap">{label}</span>
			</a>
		{/each}
	</nav>

	<div class="card-body rounded-b-2xl p-3 sm:p-8">
		{@render children?.()}
	</div>
</div>
