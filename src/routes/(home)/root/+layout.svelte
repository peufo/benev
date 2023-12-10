<script>
	import { page } from '$app/stores'

	const tabs = [
		{ label: 'Model de mail', path: '/root/mails' },
		{ label: 'Migration', path: '/root/migrate' },
		{ label: 'Évènements', path: '/root/events' },
		{ label: 'Messages', path: '/root/messages' },
	]
</script>

<div class="flex gap-4 items-center py-3">
	<h2 class="text-lg font-medium text-base-content/80">Hey root user</h2>
	{#each tabs as tab}
		{@const active = $page.route.id?.includes(tab.path)}
		<a
			href={tab.path}
			class="menu-item"
			class:bg-secondary={active}
			class:text-secondary-content={active}
		>
			{tab.label}
		</a>
	{/each}
</div>

<slot />
