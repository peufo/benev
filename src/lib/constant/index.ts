import {
	type IconProps,
	AlignLeftIcon,
	ArchiveIcon,
	CheckIcon,
	CircleUserIcon,
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
	PickaxeIcon,
	SquareCheckIcon,
	TypeIcon,
	XIcon,
} from '@lucide/svelte'
import type { Component } from 'svelte'
import { PRICE_STANDARD, PRICE_PREMIUM, PRICE_STANDARD_TO_PREMIUM } from '$app/env/public'
import type {
	EventState,
	EventTier,
	Field,
	Page,
	PageState,
	Subscribe,
	TeamState,
} from '@prisma/client'
import type { OptionRecord } from 'fuma'

/** Durée minimale d'une période de travail. */
export const PERIOD_MIN_MINUTES = 15
export const PERIOD_MIN_MS = PERIOD_MIN_MINUTES * 60_000

/** Durée proposée par le formulaire d'un créneau encore vide. */
export const PERIOD_DEFAULT_MINUTES = 240
export const PERIOD_DEFAULT_MS = PERIOD_DEFAULT_MINUTES * 60_000

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

/** Ce qu'un registre d'états décrit: le bloc de statut et les badges le lisent tel quel. */
export type StateOption = {
	label: string
	icon: Component<IconProps>
	description: string
	class: string
}

export const EVENT_STATES: Record<EventState, StateOption> = {
	draft: {
		icon: PickaxeIcon,
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

/**
 * Un secteur naît en brouillon: tant qu'il y reste, les bénévoles ne le voient pas et aucun
 * courriel ne leur part, même quand un responsable les inscrit. Le quitter envoie les demandes
 * restées en attente, et c'est sans retour: validé ou publié, un secteur ne redevient pas
 * brouillon. Les libellés sont courts, ils servent aux badges du journal et aux toasts.
 */
export const TEAM_STATES: Record<TeamState, StateOption> = {
	draft: {
		icon: PickaxeIcon,
		label: 'Brouillon',
		class: 'text-warning',
		description: `Les bénévoles ne voient ni le secteur, ni les inscriptions que tu leur prépares. Aucun courriel ne part.`,
	},
	validated: {
		icon: CheckIcon,
		label: 'Validé',
		class: 'text-info',
		description: `Les bénévoles inscrits sont prévenus et retrouvent leurs créneaux. Le secteur n'est pas listé, personne ne s'y inscrit seul.`,
	},
	published: {
		icon: GlobeIcon,
		label: 'Publié',
		class: 'text-success',
		description: `Listé pour tous les bénévoles, inscription libre selon les conditions d'accès.`,
	},
} as const

export const PAGE_STATES: Record<PageState, StateOption> = {
	draft: {
		icon: PickaxeIcon,
		label: 'Brouillon',
		class: 'text-warning',
		description: `Seuls les organisateur·ices voient cette page.`,
	},
	published: {
		icon: GlobeIcon,
		label: 'Page publiée',
		class: 'text-success',
		description: `La page est dans la navigation du site.`,
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
		priceId: PRICE_STANDARD,
	},
	premium: {
		label: 'Premium',
		max: null,
		price: '249 CHF',
		priceId: PRICE_PREMIUM,
		upgradePriceId: { standard: PRICE_STANDARD_TO_PREMIUM },
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

export { TERMS_VERSION } from './terms'

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
