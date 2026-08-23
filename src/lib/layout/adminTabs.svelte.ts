import type { Icon as LucideIcon } from '@lucide/svelte'
import {
	ChartGanttIcon,
	FileTextIcon,
	LayoutDashboardIcon,
	UsersIcon,
	ClipboardListIcon,
	CircleQuestionMarkIcon,
	MapPinnedIcon,
	GiftIcon,
	SettingsIcon,
} from '@lucide/svelte'

import { param } from 'fuma'
import { dev } from '$app/environment'
import { page } from '$app/state'
import { eventPath, type EventRouteWithoutParams } from '$lib/eventPath'

export function adminTabs() {
	const query = param.without('skip', 'take', 'form_period')
	const getPath = (p: EventRouteWithoutParams) => ({
		href: `${eventPath(p)}?${query}`,
		isActive: !!page.route.id?.startsWith(`/[eventId]${p}`),
	})

	const tabs: {
		href: string
		isActive: boolean
		label: string
		icon: typeof LucideIcon
	}[] = [
		{
			...getPath('/admin/dashboard'),
			label: 'Tableau de bord',
			icon: LayoutDashboardIcon,
		},
		{
			...getPath('/admin/teams'),
			label: 'Secteurs',
			icon: MapPinnedIcon,
		},
		{
			...getPath('/admin/members'),
			label: 'Membres',
			icon: UsersIcon,
		},
		{
			...getPath('/admin/subscribes'),
			label: 'Inscriptions',
			icon: ClipboardListIcon,
		},
		{
			...getPath('/admin/plan'),
			label: 'Planification',
			icon: ChartGanttIcon,
		},
		{
			...getPath('/admin/settings'),
			label: 'Réglages',
			icon: SettingsIcon,
		},
		{
			...getPath('/admin/pages'),
			label: 'Publications',
			icon: FileTextIcon,
		},
		{
			...getPath('/help'),
			label: 'Aide',
			icon: CircleQuestionMarkIcon,
		},
	]

	// Insertion relative: un index en dur se décale au moindre onglet ajouté ou fusionné.
	if (dev)
		tabs.splice(
			tabs.findIndex(({ label }) => label === 'Publications'),
			0,
			{
				...getPath('/admin/gift'),
				label: 'Prestations',
				icon: GiftIcon,
			}
		)

	return tabs
}
