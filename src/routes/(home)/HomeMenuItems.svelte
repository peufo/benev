<script lang="ts">
	import { CalendarDays, Heart, MessagesSquare } from 'lucide-svelte'
	import { page } from '$app/stores'

	const tabs: { path: string; label: string; icon: typeof Heart }[] = [
		{ path: '/open-source', label: 'Open source', icon: Heart },
		{ path: '/contact', label: 'Contact', icon: MessagesSquare },
		{ path: '/events', label: 'Évènements', icon: CalendarDays },
	]
</script>

{#each tabs as { path, label, icon }}
	{@const active = $page.route.id?.startsWith(`/(home)${path}`)}
	<a href={path} class="menu-item" class:active>
		<svelte:component this={icon} size={20} class="opacity-70" />
		{label}
	</a>
{/each}
