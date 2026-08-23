import type { Event } from '@prisma/client'
import { iso } from './logTypes'

// TODO: utiliser une fonction du genre au lieu de projeter toutes les propriété
// function pick<T, Keys = (keyof T)[]>(source: T, keys: Keys) {
// 	const res: Partial<T> = {}
// 	for (const key of keys) {
// 		res[key] = source[key]
// 	}
// 	return res as { [K in Keys[number]]: T[K] }
// }

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

/**
 * Identité et règles d'adhésion — ce dont dépend « pourquoi les inscriptions sont fermées ? ».
 * Le thème (couleurs, flou, médias) est écrit par le même formulaire mais reste hors journal:
 * il ne change rien à ce que vivent les bénévoles.
 */
export function projectEvent(event: Event) {
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
		backgroundColor: event.backgroundColor,
		backgroundImageId: event.backgroundImageId,
		backgroundBlur: event.backgroundBlur,
		backgroundBrightness: event.backgroundBrightness,
		backgroundWhiteness: event.backgroundWhiteness,
		backgroundGrain: event.backgroundGrain,
		backgroundPreset: event.backgroundPreset,
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

/** La valeur d'un champ de profil, telle que la colonne JSON la restituera. */
export type ProfileValue = string | string[] | number | boolean | null

export type ProfileSnapshot = Record<string, ProfileValue>

/**
 * Les champs de profil sont libres par évènement: l'instantané les indexe par leur **nom** et
 * non par leur id — un cuid ne se lit pas dans un diff, et le nom figé reste vrai après le
 * renommage ou la suppression du champ.
 *
 * Seuls les champs passés en argument entrent: c'est l'appelant qui tient la liste de ce que
 * l'acteur avait le droit d'écrire.
 */
export function projectProfile(
	fields: { id: string; name: string }[],
	profile: PrismaJson.MemberProfile
): ProfileSnapshot {
	return Object.fromEntries(fields.map(({ id, name }) => [name, profile[id] ?? null]))
}
