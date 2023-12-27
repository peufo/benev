<script lang="ts">
	import { mdiCardAccountDetailsOutline, mdiCalendarMultiple, mdiLicense } from '@mdi/js'
	import type { Tab } from '$lib/types'
	import { Card, Tabs } from '$lib/material'
	import { derived, type Readable } from 'svelte/store'
	import { page } from '$app/stores'
	import { dev } from '$app/environment'

	const tabs: Readable<Tab[]> = derived(page, (_page) => {
		const routeId = _page.route.id
		const tabs: Tab[] = [
			{
				href: '/me/events',
				label: 'Mes évènements',
				icon: mdiCalendarMultiple,
				isActive: routeId?.startsWith('/(home)/me/events') || routeId?.startsWith('/[eventId]'),
			},
			{
				href: '/me/account',
				label: 'Mon compte',
				icon: mdiCardAccountDetailsOutline,
			},
		]

		// licenccing hiden in production
		if (dev)
			tabs.push({
				href: '/me/licences',
				label: 'Mes licences',
				icon: mdiLicense,
			})

		return tabs
	})
</script>

<Card class="max-w-2xl mx-auto">
	<svelte:fragment slot="top">
		<Tabs tabs={$tabs} />
	</svelte:fragment>
	<slot />
</Card>
