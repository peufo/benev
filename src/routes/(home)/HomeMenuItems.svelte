<script lang="ts">
	import { mdiCalendarMultiple, mdiForumOutline, mdiHeartOutline } from '@mdi/js'
	import { page } from '$app/stores'
	import { Icon } from 'fuma'

	const tabs: { path: string; label: string; icon: string }[] = [
		{ path: '/open-source', label: 'Open source', icon: mdiHeartOutline },
		{ path: '/contact', label: 'Contact', icon: mdiForumOutline },
		{ path: '/events', label: 'Évènements', icon: mdiCalendarMultiple },
		// { path: '/pricing', label: 'Prix', icon: mdiWalletOutline },
	]
</script>

{#each tabs as { path, label, icon }}
	{@const active = $page.route.id?.startsWith(`/(home)${path}`)}
	<a href={path} class="menu-item" class:active>
		<Icon path={icon} size={20} class="opacity-70" />
		{label}
	</a>
{/each}
