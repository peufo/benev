import {
	mdiChartGantt,
	mdiFileDocumentMultipleOutline,
	mdiAccountMultipleOutline,
	mdiClipboardTextMultipleOutline,
	mdiHelp,
	mdiMapMarkerRadiusOutline,
	mdiCalendarStar,
	mdiLogin,
	mdiGiftOutline,
} from '@mdi/js'

import { dev } from '$app/environment'
import { derived } from 'svelte/store'
import { param } from '$lib/store'

export const adminTabs = derived(param, ({ without, page }) => {
	const query = without('skip', 'take')
	const eventId = page.params.eventId

	const getPath = (p: string) => ({
		href: `/${eventId}${p}${query}`,
		isActive: !!page.route.id?.startsWith(`/[eventId]${p}`),
	})

	const tabs = [
		{
			...getPath('/teams'),
			label: 'Secteurs',
			icon: mdiMapMarkerRadiusOutline,
		},
		{
			...getPath('/admin/members'),
			label: 'Membres',
			icon: mdiAccountMultipleOutline,
		},
		{
			...getPath('/admin/subscribes'),
			label: 'Inscriptions',
			icon: mdiClipboardTextMultipleOutline,
		},
		{
			...getPath('/admin/plan'),
			label: 'Planification',
			icon: mdiChartGantt,
		},
		{
			...getPath('/admin/event'),
			label: "L'évènement",
			icon: mdiCalendarStar,
		},
		{
			...getPath('/admin/adhesion'),
			label: 'Adhésion',
			icon: mdiLogin,
		},

		{
			...getPath('/admin/pages'),
			label: 'Publication',
			icon: mdiFileDocumentMultipleOutline,
		},
		{
			...getPath('/help'),
			label: 'Aide',
			icon: mdiHelp,
		},
	]

	if (dev)
		tabs.splice(6, 0, {
			...getPath('/admin/gift'),
			label: 'Prestations',
			icon: mdiGiftOutline,
		})

	return tabs
})
