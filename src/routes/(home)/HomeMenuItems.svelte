<script lang="ts">
	import { CalendarDays, Heart, MessagesSquare } from '@lucide/svelte'
	import { page } from '$app/state'

	const tabs: { path: string; label: string; icon: typeof Heart }[] = [
		{ path: '/open-source', label: 'Open source', icon: Heart },
		{ path: '/contact', label: 'Contact', icon: MessagesSquare },
		{ path: '/events', label: 'Évènements', icon: CalendarDays },
	]
</script>

{#each tabs as { path, label, icon } (path)}
	{@const active = page.route.id?.startsWith(`/(home)${path}`)}
	{@const SvelteComponent = icon}
	<a href={path} class="menu-item" class:active>
		<SvelteComponent size={20} class="opacity-70" />
		{label}
	</a>
{/each}
