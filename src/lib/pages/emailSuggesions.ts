import type { MemberWithComputedValues } from '$lib/server'
import { domain } from '$lib/email'
import { type Replacer } from './injectValues'
import type { EmailEvent } from '$lib/email/models'
import type { Period, Subscribe, Team, User } from '@prisma/client'
import { formatRange } from '$lib/formatRange'

type SubscribeWithTeam = Subscribe & {
	period: Period & { team: Team }
}
type WithMember<Data extends Record<string, unknown>> = { member: MemberWithComputedValues } & Data
type PropsOf<Keys extends string, U extends Record<Keys, Record<string, unknown>>> = U
type EmailProps = PropsOf<
	EmailEvent,
	{
		invitation_create: { tokenId: string; authorName: string }
		invitation_accept: {}
		subscribe_request: { subscribe: SubscribeWithTeam; authorName: string }
		subscribe_accepted: { subscribe: SubscribeWithTeam }
		subscribe_denied: { subscribe: SubscribeWithTeam }
		subscribe_cancelled: { subscribe: SubscribeWithTeam }
	}
>
type Suggestion<Path extends EmailEvent> = {
	id: string
	label: string
	getValue: (data: WithMember<EmailProps[Path]>) => string
}
type EmailSuggestions = {
	[Path in EmailEvent]: Suggestion<Path>[]
}
type EmailReplacers = {
	[Path in EmailEvent]: (data: WithMember<EmailProps[Path]>) => Replacer[]
}

const suggestionAuthorName: Suggestion<'invitation_create' | 'subscribe_request'> = {
	id: 'authorName',
	label: "Auteur de l'invitation",
	getValue: (data) => data.authorName,
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
		getValue: (data) => formatRange(data.subscribe.period),
	},
]

export const emailSuggestions: EmailSuggestions = {
	invitation_create: [
		suggestionAuthorName,
		{
			id: 'acceptURL',
			label: "Lien pour accepter l'invitation",
			getValue: (data) => {
				const href = data.tokenId
					? `${domain}/token/${data.tokenId}/reset_password?redirectTo=/${data.member.eventId}/me`
					: `${domain}/${data.member.eventId}/me`
				return `<a href="${href}" data-sveltekit-preload-data="off">ce lien</a>`
			},
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
		[path]: (data: any) => suggestions.map(({ id, getValue }) => ({ id, value: getValue(data) })),
	}),
	{} as EmailReplacers
)
