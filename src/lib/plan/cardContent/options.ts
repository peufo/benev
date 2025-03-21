import { page } from '$app/stores'
import { mdiClockOutline, mdiPercent, mdiPlaylistCheck, mdiTagMultipleOutline } from '@mdi/js'
import { derived } from 'svelte/store'

type CardContentOption = 'showProgress' | 'hideRangetime' | 'showSlots' | 'showTags'

export const CARD_CONTENT_OPTIONS: Record<
	CardContentOption,
	{ title: string; path: string; isReversed?: boolean }
> = {
	hideRangetime: { title: 'Afficher les heures', path: mdiClockOutline, isReversed: true },
	showProgress: { title: "Afficher l'état des inscriptions", path: mdiPercent },
	showSlots: { title: 'Afficher les inscriptions', path: mdiPlaylistCheck },
	showTags: { title: 'Afficher les étiquettes', path: mdiTagMultipleOutline },
}

export const cardContentOptions = derived(page, ({ url }) =>
	Object.keys(CARD_CONTENT_OPTIONS).reduce<Partial<Record<CardContentOption, boolean>>>(
		(acc, key) => ({ ...acc, [key]: url.searchParams.has(key) }),
		{}
	)
)
