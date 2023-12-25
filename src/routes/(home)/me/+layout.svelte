<script lang="ts">
	import { mdiCardAccountDetailsOutline, mdiCalendarMultiple, mdiLicense } from '@mdi/js'
	import type { Tab } from '$lib/types'
	import { Card, Tabs } from '$lib/material'

	const tabs: Tab[] = [
		{
			href: '/me/events',
			label: 'Mes évènements',
			icon: mdiCalendarMultiple,
		},
		{
			href: '/me/account',
			label: 'Mon compte',
			icon: mdiCardAccountDetailsOutline,
		},
		{
			href: '/me/licences',
			label: 'Mes licences',
			icon: mdiLicense,
		},
	]
</script>

<Card class="max-w-2xl mx-auto">
	<svelte:fragment slot="top">
		<Tabs {tabs} />
	</svelte:fragment>

	<slot />
</Card>
