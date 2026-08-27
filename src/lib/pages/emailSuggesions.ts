import type { Period, Subscribe, Team } from '@prisma/client'
import type { MemberWithComputedValues } from '$lib/server'
import { ORIGIN } from '$app/env/public'
import type { Replacer } from './injectValues'
import type { EmailEvent } from '$lib/email/models'
import { formatRange } from '$lib/formatRange'

export type SubscribeWithTeam = Subscribe & {
	period: Period & { team: Team }
}
type PropsWithMember<Keys extends string, U extends Record<Keys, Record<string, unknown>>> = {
	[K in keyof U]: U[K] & { member: MemberWithComputedValues }
}
export type EmailModelProps = PropsWithMember<
	EmailEvent,
	{
		invitation_create: { authorName: string }
		// `{}` est ici le seul type d'« aucune prop » viable: il doit satisfaire la
		// contrainte Record<string, unknown> sans index signature, sinon l'intersection
		// `& { member }` de PropsWithMember réduit `member` à never.
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		invitation_accept: {}
		subscribe_request: { subscribe: SubscribeWithTeam; authorName: string; tokenId?: string }
		subscribe_accepted: { subscribe: SubscribeWithTeam; authorName: string }
		subscribe_denied: { subscribe: SubscribeWithTeam; authorName: string }
		subscribe_cancelled: { subscribe: SubscribeWithTeam; authorName: string }
	}
>

type Suggestion<Path extends EmailEvent> = {
	id: string
	label: string
	getValue: (data: EmailModelProps[Path]) => string
}
type EmailSuggestions = {
	[Path in EmailEvent]: Suggestion<Path>[]
}
type EmailReplacers = {
	[Path in EmailEvent]: (data: EmailModelProps[Path]) => Replacer[]
}

const suggestionAuthorName: Suggestion<'invitation_create' | 'subscribe_request'> = {
	id: 'authorName',
	label: "Auteur de l'invitation",
	getValue: (data) => data.authorName,
}

/**
 * La phrase entière, et non la seule liste des secteurs: une invitation ordinaire n'en confie
 * aucun, et un gabarit qui porterait « en tant que responsable des secteurs {liste}. » afficherait
 * alors une clause vide suivie d'un point. L'espace initiale appartient donc à la valeur.
 */
const suggestionAsLeaderOf: Suggestion<'invitation_create'> = {
	id: 'asLeaderOf',
	label: 'Responsabilité des secteurs',
	getValue: ({ member }) => {
		const names = member.leaderOf.map(({ name }) => name)
		if (!names.length) return ''
		const list = new Intl.ListFormat('fr', { type: 'conjunction' }).format(names)
		return names.length === 1
			? ` en tant que responsable du secteur ${list}`
			: ` en tant que responsable des secteurs ${list}`
	},
}

const suggestionsSubscribe: Suggestion<
	'subscribe_request' | 'subscribe_accepted' | 'subscribe_cancelled' | 'subscribe_denied'
>[] = [
	{
		id: 'subscribe.period.team.name',
		label: 'Secteur de travail',
		getValue: (data) => data.subscribe.period.team.name,
	},
	{
		id: 'subscribe.period',
		label: 'Période de travail',
		getValue: (data) => formatRange(data.subscribe.period, data.member.event.timezone),
	},
]

export const emailSuggestions: EmailSuggestions = {
	invitation_create: [
		suggestionAuthorName,
		suggestionAsLeaderOf,
		{
			id: 'acceptURL',
			label: "Lien pour accepter l'invitation",
			getValue: ({ member }) =>
				`<a href="${ORIGIN}/${member.eventId}/me" data-sveltekit-preload-data="off">ce lien</a>`,
		},
	],
	invitation_accept: [],
	subscribe_request: [suggestionAuthorName, ...suggestionsSubscribe],
	subscribe_accepted: suggestionsSubscribe,
	subscribe_denied: suggestionsSubscribe,
	subscribe_cancelled: suggestionsSubscribe,
}

export const emailReplacers: EmailReplacers = Object.entries(emailSuggestions).reduce(
	(acc, [path, suggestions]) => ({
		...acc,
		// `Object.entries` perd la corrélation entre `path` et son type de props:
		// `suggestions` devient l'union de tous les `Suggestion<Path>[]`, dont les
		// `getValue` n'acceptent plus qu'un paramètre commun. `never` satisfait toutes
		// les signatures; le cast final en EmailReplacers rétablit le type par chemin.
		[path]: (data: never) => suggestions.map(({ id, getValue }) => ({ id, value: getValue(data) })),
	}),
	{} as EmailReplacers
)
