<script lang="ts">
	import { CalendarDays, Heart, MessagesSquare } from '@lucide/svelte'
	import { page } from '$app/state'
	import type { ClassValue } from 'svelte/elements'

	let { class: klass }: { class?: ClassValue } = $props()

	const tabs: { path: string; label: string; Icon: typeof Heart }[] = [
		{ path: '/open-source', label: 'Open source', Icon: Heart },
		{ path: '/contact', label: 'Contact', Icon: MessagesSquare },
		{ path: '/events', label: 'Évènements', Icon: CalendarDays },
	]
</script>

{#each tabs as { path, label, Icon } (path)}
	{@const active = page.route.id?.startsWith(`/(home)${path}`)}
	<a href={path} class={['menu-item', klass]} class:active>
		<Icon size={20} class="opacity-70" />
		{label}
	</a>
{/each}
