import {
	type IconProps,
	AlignLeftIcon,
	ArchiveIcon,
	CheckIcon,
	CircleUserIcon,
	ConstructionIcon,
	FileTextIcon,
	GlobeIcon,
	HandshakeIcon,
	HashIcon,
	HouseIcon,
	ListChecksIcon,
	ListIcon,
	MailIcon,
	OctagonAlertIcon,
	OctagonXIcon,
	SquareCheckIcon,
	TypeIcon,
	XIcon,
} from '@lucide/svelte'
import type { Component } from 'svelte'
import env from '$app/env/public'
import type { EventState, EventTier, Field, Page, Subscribe } from '@prisma/client'
import type { OptionRecord } from 'fuma'

/** Durée minimale d'une période de travail. */
export const PERIOD_MIN_MINUTES = 15
export const PERIOD_MIN_MS = PERIOD_MIN_MINUTES * 60_000

export const FORMAT_CARD = {
	x: 53.98,
	y: 85.6,
	aspect: 53.98 / 85.6,
}

export const MEDIA_PRESETS = {
	small: [128, 128],
	medium: [256, 256],
	large: [512, 512],
	a6: [105, 148],
	a5: [148, 210],
	a4: [210, 297],
	a3: [297, 420],
	a2: [420, 594],
	a1: [594, 841],
} as const

export type ThemePreset = {
	label: string
	image: string
	backgroundBlur: number
	backgroundBrightness: number
	backgroundWhiteness: number
	backgroundGrain: number
}

/**
 * Les habillages prêts à poser d'un évènement. Leurs teintes se dérivent des tokens de la charte
 * et restent claires: le texte des pages bénévoles se lit à même ce fond. `backgroundColor` porte
 * la dominante du dégradé — c'est lui qu'on voit tant que l'image n'est pas chargée.
 */
export const THEME_PRESETS = {
	benevio: {
		label: 'benevio',
		image: '/themes/benevio.svg',
		backgroundBlur: 0,
		backgroundBrightness: 100,
		backgroundWhiteness: 0,
		backgroundGrain: 0.8,
	},
	papier: {
		label: 'Papier',
		image: '/themes/papier.svg',
		backgroundBlur: 0,
		backgroundBrightness: 100,
		backgroundWhiteness: 0,
		backgroundGrain: 0.7,
	},
	prairie: {
		label: 'Prairie',
		image: '/themes/prairie.svg',
		backgroundBlur: 0,
		backgroundBrightness: 100,
		backgroundWhiteness: 0,
		backgroundGrain: 0.35,
	},
	crepuscule: {
		label: 'Crépuscule',
		image: '/themes/crepuscule.svg',
		backgroundBlur: 0,
		backgroundBrightness: 100,
		backgroundWhiteness: 0,
		backgroundGrain: 0.4,
	},
} satisfies Record<string, ThemePreset>

export type ThemePresetKey = keyof typeof THEME_PRESETS

export const EVENT_STATES: Record<
	EventState,
	{ label: string; icon: Component<IconProps>; description: string; class: string }
> = {
	draft: {
		icon: ConstructionIcon,
		label: 'Évènement en construction',
		class: 'text-warning',
		description: `Seul les responsables ont accès au site de l'évènement.`,
	},
	published: {
		icon: GlobeIcon,
		label: 'Évènement publié',
		class: 'text-success',
		description: `Le site est publiquement disponible.`,
	},
	archived: {
		icon: ArchiveIcon,
		label: 'Évènement archivé',
		class: 'text-base-content/70',
		description: `Seul les responsables ont accès au site de l'évènement.`,
	},
} as const

export const EVENT_TIER: Record<
	EventTier,
	{
		label: string
		max: number | null
		price: string
		priceId: string | null
		upgradePriceId?: Partial<Record<EventTier, string>>
	}
> = {
	basic: {
		label: 'Basique',
		max: 50,
		price: '0 CHF',
		priceId: null,
	},
	standard: {
		label: 'Standard',
		max: 200,
		price: '99 CHF',
		priceId: env.PRICE_STANDARD,
	},
	premium: {
		label: 'Premium',
		max: null,
		price: '249 CHF',
		priceId: env.PRICE_PREMIUM,
		upgradePriceId: { standard: env.PRICE_STANDARD_TO_PREMIUM },
	},
	pro: {
		label: 'Pro',
		max: null,
		price: 'Sur mesure',
		priceId: null,
	},
} as const

/**
 * Délais de réponse du support, affichés sur la page tarifs et sur la page quota d'un évènement.
 * Ce sont des cibles indicatives et non des garanties: les conditions de vente le disent, et les
 * deux pages partagent la même phrase pour ne pas promettre deux choses différentes.
 */
export const EVENT_TIER_SUPPORT: Partial<Record<EventTier, string>> = {
	standard: `Support email — réponse généralement sous 5 jours ouvrables`,
	premium: `Support email 7/7 — réponse généralement sous 24 heures`,
	pro: `Support prioritaire — ligne directe avec l'équipe`,
} as const

/**
 * Date d'effet des textes légaux, stockée sur l'utilisateur au moment de l'acceptation.
 * Un booléen seul ne dit pas *quelles* conditions ont été acceptées, ce qui est précisément
 * ce dont on a besoin le jour où elles changent.
 */
export const TERMS_VERSION = '2026-08-20'

/**
 * Découpe le prix d'un plan en valeur et devise.
 * `unit` est absent pour les plans sans montant chiffré (« Sur mesure »).
 */
export function parseTierPrice(price: string): { value: string; unit?: string } {
	const [value, unit] = price.split(' ')
	if (!unit || isNaN(+value)) return { value: price }
	return { value, unit }
}

export const MEMBER_FIELD_TYPE: OptionRecord<Field['type']> = {
	string: { label: 'Text', icon: TypeIcon },
	textarea: { label: 'Text long', icon: AlignLeftIcon },
	number: { label: 'Nombre', icon: HashIcon },
	boolean: { label: 'Oui / Non', icon: SquareCheckIcon },
	select: { label: 'Liste à choix', icon: ListIcon },
	multiselect: { label: 'Liste à choix multiple', icon: ListChecksIcon },
} as const

export const SUBSCRIBE_STATE: OptionRecord<Subscribe['state']> = {
	request: { label: 'Demande en cours', icon: OctagonAlertIcon, class: 'text-warning' },
	accepted: { label: 'Validé', icon: CheckIcon, class: 'text-success' },
	denied: { label: 'Décliné', icon: OctagonXIcon, class: 'text-error' },
	cancelled: { label: 'Annulé', icon: XIcon, class: 'text-error' },
} as const

export const SUBSCRIBE_STATE_ACTION: OptionRecord<Subscribe['state']> = {
	request: { ...SUBSCRIBE_STATE.request, label: 'Rétablir' },
	accepted: { ...SUBSCRIBE_STATE.accepted, label: 'Confirmer' },
	denied: { ...SUBSCRIBE_STATE.denied, label: 'Décliner' },
	cancelled: { ...SUBSCRIBE_STATE.cancelled, label: 'Annuler' },
}

export const PAGE_TYPE: OptionRecord<Page['type']> = {
	home: { label: 'Accueil', icon: HouseIcon },
	charter: { label: 'Charte des bénévoles', icon: HandshakeIcon },
	public: { label: 'Page publique', icon: FileTextIcon },
	member: { label: 'Page de membre', icon: CircleUserIcon },
	email: { label: "Model d'email", icon: MailIcon },
} as const
