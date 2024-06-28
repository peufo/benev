import { page } from '$app/stores'
import { mdiClockOutline, mdiPercent, mdiPlaylistCheck } from '@mdi/js'
import type { OptionRecord } from 'fuma'
import { derived } from 'svelte/store'

type CardContentOption = 'showProgress' | 'hideRangetime' | 'showSlots'

export const CARD_CONTENT_OPTIONS: OptionRecord<CardContentOption> = {
	showProgress: { label: "Afficher l'état des inscriptions", icon: mdiPercent },
	hideRangetime: { label: 'Afficher les heures', icon: mdiClockOutline },
	showSlots: { label: 'Afficher les inscriptions', icon: mdiPlaylistCheck },
}

export const cardContentOptions = derived(page, ({ url }) =>
	Object.keys(CARD_CONTENT_OPTIONS).reduce<Partial<Record<CardContentOption, boolean>>>(
		(acc, key) => ({ ...acc, [key]: url.searchParams.has(key) }),
		{}
	)
)
