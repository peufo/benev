import type {
	EventState,
	Field,
	GiftConditionType,
	GiftConditionsMode,
	LicenceType,
	Subscribe,
} from '@prisma/client'
import {
	mdiArchiveOutline,
	mdiEarth,
	mdiTestTube,
	mdiTextShort,
	mdiText,
	mdiNumeric,
	mdiCheckboxIntermediateVariant,
	mdiOrderBoolDescending,
	mdiOrderBoolAscendingVariant,
	mdiCheck,
	mdiExcavator,
} from '@mdi/js'
import { PUBLIC_FREE_EVENT_MAX_MEMBERS } from '$env/static/public'

export const FORMAT_A3 = {
	x: 297,
	y: 420,
	aspect: 297 / 420,
} as const

export const MEDIA_PRESETS = {
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
	{ label: string; icon: string; description: string; class: string }
> = {
	draft: {
		icon: mdiTestTube,
		label: 'Évènement en projet',
		class: 'border-warning',
		description: `L'évènement est limité à ${PUBLIC_FREE_EVENT_MAX_MEMBERS} membres validés et seul les responsables y ont accès.`,
	},
	actived: {
		icon: mdiExcavator,
		label: 'Évènement en construction',
		class: 'border-warning',
		description: `Seul les responsables ont accès au site de l'évènement.`,
	},
	published: {
		icon: mdiEarth,
		label: 'Évènement publié',
		class: 'border-success',
		description: `Le site est publiquement disponible.`,
	},
	archived: {
		icon: mdiArchiveOutline,
		label: 'Évènement archivé',
		class: '',
		description: `Seul les responsables ont accès au site de l'évènement.`,
	},
} as const

export const GIFT_CONDITION_MODE: Record<GiftConditionsMode, string> = {
	sum: 'Somme des conditions',
	highest: 'Plus haute condition',
}
export const GIFT_CONDITION_TYPE: Record<GiftConditionType, string> = {
	teams: `Doit être inscrit à l'un de ces secteurs`,
	hours: `Doit avoir un minimum d'heure de travail de`,
	period: `Doit travailer durant la période de`,
} as const

export const LICENCE_TYPE_LABEL: Record<LicenceType, string> = {
	event: 'Évènement',
	member: 'Membre',
} as const

export const MEMBER_FIELD_TYPE: Record<Field['type'], { label: string; icon: string }> = {
	string: { label: 'Text', icon: mdiTextShort },
	textarea: { label: 'Text long', icon: mdiText },
	number: { label: 'Nombre', icon: mdiNumeric },
	boolean: { label: 'Oui / Non', icon: mdiCheckboxIntermediateVariant },
	select: { label: 'Liste à choix', icon: mdiOrderBoolDescending },
	multiselect: { label: 'Liste à choix multiple', icon: mdiOrderBoolAscendingVariant },
} as const

export const SUBSCRIBE_STATE: Record<Subscribe['state'], string> = {
	request: 'Demande en cours',
	accepted: 'Validé',
	denied: 'Décliné',
	cancelled: 'Annulé',
} as const
