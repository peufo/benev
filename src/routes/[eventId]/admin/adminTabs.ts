import {
	mdiChartGantt,
	mdiFileDocumentMultipleOutline,
	mdiAccountMultipleOutline,
	mdiClipboardTextMultipleOutline,
	mdiCogs,
} from '@mdi/js'

import { derived } from 'svelte/store'
import { param } from '$lib/store'

export const adminTabs = derived(param, ({ without, page }) => {
	const query = without('skip', 'take')
	const eventId = page.params.eventId

	const getPath = (p: string) => ({
		href: `/${eventId}${p}${query}`,
		isActive: !!page.route.id?.startsWith(`/[eventId]${p}`),
	})

	return [
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
			...getPath('/admin/config'),
			label: 'Configuration',
			icon: mdiCogs,
		},
		{
			...getPath('/admin/pages'),
			label: 'Les pages',
			icon: mdiFileDocumentMultipleOutline,
		},
	]
})
