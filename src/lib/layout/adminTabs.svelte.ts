import type { Icon as LucideIcon } from '@lucide/svelte'
import {
	ChartGanttIcon,
	FileTextIcon,
	LayoutDashboardIcon,
	UsersIcon,
	ClipboardListIcon,
	CircleQuestionMarkIcon,
	MapPinnedIcon,
	SettingsIcon,
} from '@lucide/svelte'

import { param } from 'fuma'
import { page } from '$app/state'
import type { ResolvedPathname } from '$app/types'
import { eventPath, withSearch, type EventRouteWithoutParams } from '$lib/eventPath'

type AdminTab = {
	href: ResolvedPathname
	isActive: boolean
	label: string
	icon: typeof LucideIcon
}

export function adminTabs(): AdminTab[] {
	const query = param.without('skip', 'take', 'form_period')
	const getPath = (p: EventRouteWithoutParams) => ({
		href: withSearch(eventPath(p), query),
		isActive: !!page.route.id?.startsWith(`/[eventId]${p}`),
	})

	return [
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
			label: 'Configuration',
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
}
