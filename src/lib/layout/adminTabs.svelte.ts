import type { Icon as LucideIcon } from '@lucide/svelte'
import {
	ChartGantt,
	FileText,
	Users,
	ClipboardList,
	CircleQuestionMark,
	MapPin,
	Calendar,
	LogIn,
	Gift,
	Palette,
} from '@lucide/svelte'

import { param } from 'fuma'
import { dev } from '$app/environment'
import { page } from '$app/state'

// `param` de fuma 2 est un objet runes sans référence à `page`, et n'est plus un store:
// `derived` laisse place à une fonction qui relit l'état réactif à chaque appel.
export function adminTabs() {
	const query = param.without('skip', 'take', 'form_period')
	const eventId = page.params.eventId

	const getPath = (p: string) => ({
		href: `/${eventId}${p}${query}`,
		isActive: !!page.route.id?.startsWith(`/[eventId]${p}`),
	})

	const tabs: {
		href: string
		isActive: boolean
		label: string
		icon: typeof LucideIcon
	}[] = [
		{
			...getPath('/teams'),
			label: 'Secteurs',
			icon: MapPin,
		},
		{
			...getPath('/admin/members'),
			label: 'Membres',
			icon: Users,
		},
		{
			...getPath('/admin/subscribes'),
			label: 'Inscriptions',
			icon: ClipboardList,
		},
		{
			...getPath('/admin/plan'),
			label: 'Planification',
			icon: ChartGantt,
		},
		{
			...getPath('/admin/event'),
			label: "L'évènement",
			icon: Calendar,
		},
		{
			...getPath('/admin/adhesion'),
			label: 'Adhésion',
			icon: LogIn,
		},
		{
			...getPath('/admin/theme'),
			label: 'Thème',
			icon: Palette,
		},
		{
			...getPath('/admin/pages'),
			label: 'Publications',
			icon: FileText,
		},
		{
			...getPath('/help'),
			label: 'Aide',
			icon: CircleQuestionMark,
		},
	]

	if (dev)
		tabs.splice(6, 0, {
			...getPath('/admin/gift'),
			label: 'Prestations',
			icon: Gift,
		})

	return tabs
}
