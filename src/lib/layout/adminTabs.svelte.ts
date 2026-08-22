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
			...getPath('/admin/dashboard'),
			label: 'Tableau de bord',
			icon: LayoutDashboardIcon,
		},
		{
			...getPath('/teams'),
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
			sections: SETTINGS_SECTIONS,
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
				...getPath('/admin/giftIconGiftIcon'),
				label: 'Prestations',
				icon: GiftIcon,
			}
		)

	return tabs
}
