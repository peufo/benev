import type { ComponentType, SvelteComponent } from 'svelte'
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
} from 'lucide-svelte'

import { param } from 'fuma'
import { dev } from '$app/environment'
import { derived } from 'svelte/store'

export const adminTabs = derived(param, ({ without, page }) => {
	const query = without('skip', 'take', 'form_period')
	const eventId = page.params.eventId

	const getPath = (p: string) => ({
		href: `/${eventId}${p}${query}`,
		isActive: !!page.route.id?.startsWith(`/[eventId]${p}`),
	})

	const tabs: {
		href: string
		isActive: boolean
		label: string
		icon: ComponentType<SvelteComponent>
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
})
