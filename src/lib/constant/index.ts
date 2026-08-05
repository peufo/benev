import {
	AlignLeftIcon,
	ArchiveIcon,
	CircleUserIcon,
	ConstructionIcon,
	FileTextIcon,
	GlobeIcon,
	HashIcon,
	HouseIcon,
	type IconProps,
	ListChecksIcon,
	ListIcon,
	MailIcon,
	ScrollTextIcon,
	SquareCheckIcon,
	TypeIcon,
} from '@lucide/svelte'
import type { Component } from 'svelte'
import { env } from '$env/dynamic/public'
import type {
	EventState,
	EventTier,
	Field,
	GiftConditionType,
	GiftConditionsMode,
	Page,
	Subscribe,
} from '@prisma/client'

/** Durée minimale d'une période de travail. */
export const PERIOD_MIN_MINUTES = 15
export const PERIOD_MIN_MS = PERIOD_MIN_MINUTES * 60_000

export const FORMAT_A3 = {
	x: 297,
	y: 420,
	aspect: 297 / 420,
} as const

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

export const EVENT_STATES: Record<
	EventState,
	{ label: string; icon: Component<IconProps>; description: string; class: string }
> = {
	draft: {
		icon: ConstructionIcon,
		label: 'Évènement en construction',
		class: 'border-warning',
		description: `Seul les responsables ont accès au site de l'évènement.`,
	},
	published: {
		icon: GlobeIcon,
		label: 'Évènement publié',
		class: 'border-success',
		description: `Le site est publiquement disponible.`,
	},
	archived: {
		icon: ArchiveIcon,
		label: 'Évènement archivé',
		class: '',
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
		priceId: env.PUBLIC_PRICE_STANDARD,
	},
	premium: {
		label: 'Premium',
		max: null,
		price: '249 CHF',
		priceId: env.PUBLIC_PRICE_PREMIUM,
		upgradePriceId: { standard: env.PUBLIC_PRICE_STANDARD_TO_PREMIUM },
	},
	pro: {
		label: 'Pro',
		max: null,
		price: 'Sur mesure',
		priceId: null,
	},
} as const

/**
 * Découpe le prix d'un plan en valeur et devise.
 * `unit` est absent pour les plans sans montant chiffré (« Sur mesure »).
 */
export function parseTierPrice(price: string): { value: string; unit?: string } {
	const [value, unit] = price.split(' ')
	if (!unit || isNaN(+value)) return { value: price }
	return { value, unit }
}

export const GIFT_CONDITION_MODE: Record<GiftConditionsMode, string> = {
	sum: 'Somme des conditions',
	highest: 'Plus haute condition',
}
export const GIFT_CONDITION_TYPE: Record<GiftConditionType, string> = {
	teams: `Doit être inscrit à l'un de ces secteurs`,
	hours: `Doit avoir un minimum d'heure de travail de`,
	period: `Doit travailer durant la période de`,
} as const

export const MEMBER_FIELD_TYPE: Record<
	Field['type'],
	{ label: string; icon: Component<IconProps> }
> = {
	string: { label: 'Text', icon: TypeIcon },
	textarea: { label: 'Text long', icon: AlignLeftIcon },
	number: { label: 'Nombre', icon: HashIcon },
	boolean: { label: 'Oui / Non', icon: SquareCheckIcon },
	select: { label: 'Liste à choix', icon: ListIcon },
	multiselect: { label: 'Liste à choix multiple', icon: ListChecksIcon },
} as const

export const SUBSCRIBE_STATE: Record<Subscribe['state'], string> = {
	request: 'Demande en cours',
	accepted: 'Validé',
	denied: 'Décliné',
	cancelled: 'Annulé',
} as const

export const PAGE_TYPE: Record<Page['type'], { label: string; icon: Component<IconProps> }> = {
	home: { label: 'Accueil', icon: HouseIcon },
	charter: { label: 'Charte des bénévoles', icon: ScrollTextIcon },
	public: { label: 'Page publique', icon: FileTextIcon },
	member: { label: 'Page de membre', icon: CircleUserIcon },
	email: { label: "Model d'email", icon: MailIcon },
} as const
