import { iso } from './logTypes'

/**
 * Les projections tiennent lieu de liste blanche: ce qu'elles ne rendent pas n'entre jamais dans
 * le journal. Elles ne rendent que des primitives, pour que la colonne JSON restitue exactement
 * ce que le type annonce.
 */

export type MemberContactSource = {
	firstName: string
	lastName: string
	email: string | null
	phone: string | null
	birthday: Date | string | null
	street: string | null
	zipCode: string | null
	city: string | null
}

export function projectMemberContact(member: MemberContactSource) {
	return {
		firstName: member.firstName,
		lastName: member.lastName,
		email: member.email ?? null,
		phone: member.phone ?? null,
		birthday: iso(member.birthday),
		street: member.street ?? null,
		zipCode: member.zipCode ?? null,
		city: member.city ?? null,
	}
}
export type MemberContactSnapshot = ReturnType<typeof projectMemberContact>

export type EventSource = {
	id: string
	name: string
	description: string | null
	email: string | null
	phone: string | null
	web: string | null
	facebook: string | null
	instagram: string | null
	timezone: string
	location: PrismaJson.Location | null
	selfRegisterAllowed: boolean
	selfSubscribeAllowed: boolean
	selfSubscribeCancelAllowed: boolean
	closeSubscribing: Date | string | null
	overlapPeriodAllowed: number
	userEmailVerifiedRequired: boolean
	userAddressRequired: boolean
	userPhoneRequired: boolean
	userBirthdayRequired: boolean
	userAvatarRequired: boolean
}

/**
 * Identité et règles d'adhésion — ce dont dépend « pourquoi les inscriptions sont fermées ? ».
 * Le thème (couleurs, flou, médias) est écrit par le même formulaire mais reste hors journal:
 * il ne change rien à ce que vivent les bénévoles.
 */
export function projectEvent(event: EventSource) {
	return {
		id: event.id,
		name: event.name,
		description: event.description ?? null,
		email: event.email ?? null,
		phone: event.phone ?? null,
		web: event.web ?? null,
		facebook: event.facebook ?? null,
		instagram: event.instagram ?? null,
		timezone: event.timezone,
		// Réduit à son libellé: les coordonnées ne se lisent pas dans un diff.
		location: event.location?.label ?? null,
		selfRegisterAllowed: event.selfRegisterAllowed,
		selfSubscribeAllowed: event.selfSubscribeAllowed,
		selfSubscribeCancelAllowed: event.selfSubscribeCancelAllowed,
		closeSubscribing: iso(event.closeSubscribing),
		overlapPeriodAllowed: event.overlapPeriodAllowed,
		userEmailVerifiedRequired: event.userEmailVerifiedRequired,
		userAddressRequired: event.userAddressRequired,
		userPhoneRequired: event.userPhoneRequired,
		userBirthdayRequired: event.userBirthdayRequired,
		userAvatarRequired: event.userAvatarRequired,
	}
}
export type EventSnapshot = ReturnType<typeof projectEvent>

export type TeamSource = {
	name: string
	description: string | null
	closeSubscribing: Date | string | null
	overflowPermitted: boolean
	leaders?: { firstName: string; lastName: string }[]
}

export function projectTeam(team: TeamSource) {
	return {
		name: team.name,
		description: team.description ?? null,
		closeSubscribing: iso(team.closeSubscribing),
		overflowPermitted: team.overflowPermitted,
		// Les noms plutôt que les ids: un diff de cuid ne se lit pas.
		leaders: (team.leaders ?? []).map(({ firstName, lastName }) => `${firstName} ${lastName}`),
	}
}
export type TeamSnapshot = ReturnType<typeof projectTeam>

/** Un créneau, tel qu'il s'affichera dans le fil. */
export type LogPeriod = { start: string; end: string; maxSubscribe: number }

export function projectPeriod(period: {
	start: Date | string
	end: Date | string
	maxSubscribe: number
}): LogPeriod {
	return {
		start: iso(period.start) as string,
		end: iso(period.end) as string,
		maxSubscribe: period.maxSubscribe,
	}
}
