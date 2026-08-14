import type { Icon as LucideIcon } from '@lucide/svelte'
import {
	ChartGantt,
	FileText,
	Users,
	ClipboardList,
	CircleQuestionMark,
	MapPin,
	Gift,
	Settings,
} from '@lucide/svelte'

import { param } from 'fuma'
import { dev } from '$app/environment'
import { page } from '$app/state'
import { SETTINGS_SECTIONS, type SubNavSection } from './adminSubNav.svelte'

// `param` de fuma 2 est un objet runes sans référence à `page`, et n'est plus un store:
// `derived` laisse place à une fonction qui relit l'état réactif à chaque appel.
export function adminTabs() {
	const query = param.without('skip', 'take', 'form_period')
	const eventId = page.params.eventId
	const getPath = (p: string) => ({
		href: `/${eventId}${p}?${query}`,
		isActive: !!page.route.id?.startsWith(`/[eventId]${p}`),
	})

	const tabs: {
		href: string
		isActive: boolean
		label: string
		icon: typeof LucideIcon
		/** Sections internes de la page, rendues sous l'onglet quand il est actif. */
		sections?: SubNavSection[]
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
			...getPath('/admin/settings'),
			label: 'Réglages',
			icon: Settings,
			sections: SETTINGS_SECTIONS,
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

	// Insertion relative: un index en dur se décale au moindre onglet ajouté ou fusionné.
	if (dev)
		tabs.splice(
			tabs.findIndex(({ label }) => label === 'Publications'),
			0,
			{
				...getPath('/admin/gift'),
				label: 'Prestations',
				icon: Gift,
			}
		)

	return tabs
}
