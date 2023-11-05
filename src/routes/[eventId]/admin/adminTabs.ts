import {
	mdiChartGantt,
	mdiFileDocumentMultipleOutline,
	mdiAccountMultipleOutline,
	mdiClipboardTextMultipleOutline,
	mdiCogs,
} from '@mdi/js'

import { derived } from 'svelte/store'
import { param } from '$lib/store'

export const adminTabs = derived(param, ({ without }) => {
	const query = without('skip', 'take')

	return [
		{
			query,
			path: '/admin/members',
			label: 'Membres',
			icon: mdiAccountMultipleOutline,
		},
		{
			query,
			path: '/admin/subscribes',
			url: `/admin/subscribes${query}`,
			label: 'Inscriptions',
			icon: mdiClipboardTextMultipleOutline,
		},
		{
			query,
			path: '/admin/plan',
			label: 'Planification',
			icon: mdiChartGantt,
		},
		{
			query,
			path: '/admin/config',
			label: 'Configuration',
			icon: mdiCogs,
		},
		{
			query,
			path: '/admin/pages',
			label: 'Les pages',
			icon: mdiFileDocumentMultipleOutline,
		},
	]
})
