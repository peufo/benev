import {
	mdiChartGantt,
	mdiFileDocumentMultipleOutline,
	mdiAccountMultipleOutline,
	mdiClipboardTextMultipleOutline,
	mdiCogs,
} from '@mdi/js'

export const adminTabs = [
	{
		path: '/admin/members',
		label: 'Membres',
		icon: mdiAccountMultipleOutline,
	},
	{
		path: '/admin/subscribes',
		label: 'Inscriptions',
		icon: mdiClipboardTextMultipleOutline,
	},
	{
		path: '/admin/plan',
		label: 'Planification',
		icon: mdiChartGantt,
	},
	{
		path: '/admin/config',
		label: 'Configuration',
		icon: mdiCogs,
	},
	{
		path: '/admin/pages',
		label: 'Les pages',
		icon: mdiFileDocumentMultipleOutline,
	},
]
