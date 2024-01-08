<script lang="ts">
	import { mdiCalendarMultiple, mdiForumOutline, mdiScaleBalance, mdiWalletOutline } from '@mdi/js'
	import { page } from '$app/stores'
	import { eventPath } from '$lib/store'
	import { Icon } from '$lib/material'

	const tabs: { path: string; label: string; icon: string }[] = [
		{ path: '/contact', label: 'Contact', icon: mdiForumOutline },
		{ path: '/events', label: 'Évènements', icon: mdiCalendarMultiple },
		{ path: '/pricing', label: 'Prix', icon: mdiWalletOutline },
		{ path: '/terms', label: 'Conditions', icon: mdiScaleBalance },
	]
</script>

{#each tabs as { path, label, icon }}
	{@const active = $page.route.id?.startsWith(`/(home)${path}`)}
	<a href="{$eventPath}{path}" class="menu-item" class:active>
		<Icon path={icon} size={20} class="opacity-70" />
		{label}
	</a>
{/each}
