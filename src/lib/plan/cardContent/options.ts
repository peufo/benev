import { ClockIcon, type IconProps, ListChecksIcon, PercentIcon, TagsIcon } from '@lucide/svelte'
import { page } from '$app/stores'
import type { Component } from 'svelte'
import { derived } from 'svelte/store'

type CardContentOption = 'showProgress' | 'hideRangetime' | 'showSlots' | 'showTags'

export const CARD_CONTENT_OPTIONS: Record<
	CardContentOption,
	{ title: string; icon: Component<IconProps>; isReversed?: boolean }
> = {
	hideRangetime: { title: 'Afficher les heures', icon: ClockIcon, isReversed: true },
	showProgress: { title: "Afficher l'état des inscriptions", icon: PercentIcon },
	showSlots: { title: 'Afficher les inscriptions', icon: ListChecksIcon },
	showTags: { title: 'Afficher les étiquettes', icon: TagsIcon },
}

export const cardContentOptions = derived(page, ({ url }) =>
	Object.keys(CARD_CONTENT_OPTIONS).reduce<Partial<Record<CardContentOption, boolean>>>(
		(acc, key) => ({ ...acc, [key]: url.searchParams.has(key) }),
		{}
	)
)
