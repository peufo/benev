<script lang="ts">
	import { mdiCalendarMultiple, mdiGavel } from '@mdi/js'
	import { page } from '$app/stores'
	import { eventPath } from '$lib/store'
	import { Icon } from '$lib/material'

	const tabs: { path: string; label: string; icon: string }[] = [
		{ path: '/terms', label: 'Conditions', icon: mdiGavel },
		{ path: '/events', label: 'Événements', icon: mdiCalendarMultiple },
	]
</script>

{#each tabs as { path, label, icon }}
	{@const active = $page.route.id?.startsWith(`/(home)${path}`)}
	<a href="{$eventPath}{path}" class="menu-item" class:active>
		<Icon path={icon} size={20} class="opacity-70" {active} />
		{label}
	</a>
{/each}
