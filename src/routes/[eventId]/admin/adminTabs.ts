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
			path: `/admin/members${query}`,
			label: 'Membres',
			icon: mdiAccountMultipleOutline,
		},
		{
			path: `/admin/subscribes${query}`,
			label: 'Inscriptions',
			icon: mdiClipboardTextMultipleOutline,
		},
		{
			path: `/admin/plan${query}`,
			label: 'Planification',
			icon: mdiChartGantt,
		},
		{
			path: `/admin/config${query}`,
			label: 'Configuration',
			icon: mdiCogs,
		},
		{
			path: `/admin/pages${query}`,
			label: 'Les pages',
			icon: mdiFileDocumentMultipleOutline,
		},
	]
})
