<script lang="ts">
	import { CalendarDays, Heart, Menu, MessagesSquare, type IconProps } from '@lucide/svelte'
	import { Popover } from 'fuma'
	import { on } from 'svelte/events'
	import type { Component } from 'svelte'
	import type { ClassValue } from 'svelte/elements'
	import { page } from '$app/state'

	const tabs: { path: string; label: string; Icon: Component<IconProps> }[] = [
		{ path: '/open-source', label: 'Open source', Icon: Heart },
		{ path: '/contact', label: 'Contact', Icon: MessagesSquare },
		{ path: '/events', label: 'Évènements', Icon: CalendarDays },
	]
</script>

{#snippet menuItems(klass: ClassValue, classActive: ClassValue)}
	{#each tabs as { path, label, Icon } (path)}
		{@const isActive = page.route.id?.startsWith(`/(home)${path}`)}
		<a href={path} class={[klass, isActive && classActive]}>
			<Icon size={20} class="opacity-70" />
			{label}
		</a>
	{/each}
{/snippet}

<div class="gap-2 hidden lg:flex">
	{@render menuItems('btn btn-ghost', 'btn-active')}
</div>

<Popover class="my-1 min-w-50">
	{#snippet trigger({ trigger })}
		<button {...trigger} class="btn btn-square ml-2 lg:hidden">
			<Menu />
		</button>
	{/snippet}

	{#snippet children({ hide })}
		<!-- Les liens naviguent côté client: sans ce clic délégué, la feuille resterait ouverte
		     par-dessus la page d'arrivée.
		     Attaché plutôt que posé en `onclick`: le conteneur n'est pas l'élément
		     interactif, ce sont les liens qu'il porte. -->
		<div class="menu w-full p-1 gap-1" {@attach (node) => on(node, 'click', hide)}>
			{@render menuItems('menu-item', 'active')}
		</div>
	{/snippet}
</Popover>
