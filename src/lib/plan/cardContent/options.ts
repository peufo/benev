import { ClockIcon, type IconProps, ListChecksIcon, PercentIcon, TagsIcon } from '@lucide/svelte'
import { page } from '$app/state'
import type { Component } from 'svelte'

type CardContentOption = 'hideProgress' | 'hideRangetime' | 'showSlots' | 'showTags'

export const CARD_CONTENT_OPTIONS: Record<
	CardContentOption,
	{ title: string; icon: Component<IconProps>; isReversed?: boolean }
> = {
	hideRangetime: { title: 'Afficher les heures', icon: ClockIcon, isReversed: true },
	hideProgress: { title: "Afficher l'état des inscriptions", icon: PercentIcon, isReversed: true },
	showSlots: { title: 'Afficher les inscriptions', icon: ListChecksIcon },
	showTags: { title: 'Afficher les étiquettes', icon: TagsIcon },
}

export function getCardContentOptions() {
	return Object.keys(CARD_CONTENT_OPTIONS).reduce<Partial<Record<CardContentOption, boolean>>>(
		(acc, key) => ({ ...acc, [key]: page.url.searchParams.has(key) }),
		{}
	)
}
