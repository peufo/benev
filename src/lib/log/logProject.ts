import type { Event } from '@prisma/client'
import { iso } from './logTypes'

/**
 * Les projections tiennent lieu de liste blanche: ce qu'elles ne rendent pas n'entre jamais dans
 * le journal. Elles ne rendent que des primitives, pour que la colonne JSON restitue exactement
 * ce que le type annonce.
 *
 * Chaque entité déclare sa liste une seule fois, en table `clé -> libellé`: `pick` en tire
 * l'instantané, `LogDiff` y lit le nom de chaque ligne, et l'ordre de la table est celui du diff.
 * Journaliser un champ de plus tient donc en une ligne — le `satisfies` refuse une clé que
 * l'entité ne porte pas, et une clé sans libellé n'entre pas.
 *
 * Les valeurs qui demandent une conversion — une date, un lieu, des responsables — sont réécrites
 * après le `pick`. Leur clé garde sa place dans la table, donc dans l'affichage.
 */

/** Les clés listées, et elles seules. */
function pick<T extends object, K extends keyof T>(source: T, keys: readonly K[]): Pick<T, K> {
	return Object.fromEntries(keys.map((key) => [key, source[key]])) as Pick<T, K>
}

/** `Object.keys` rend des `string`; la table, elle, sait exactement ce qu'elle porte. */
function keysOf<T extends object>(labels: T): (keyof T)[] {
	return Object.keys(labels) as (keyof T)[]
}

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

export const memberContactLabels = {
	firstName: 'Prénom',
	lastName: 'Nom',
	email: 'Email',
	phone: 'Téléphone',
	birthday: 'Date de naissance',
	street: 'Rue',
	zipCode: 'NPA',
	city: 'Localité',
} satisfies Partial<Record<keyof MemberContactSource, string>>

export function projectMemberContact(member: MemberContactSource) {
	return {
		...pick(member, keysOf(memberContactLabels)),
		birthday: iso(member.birthday),
	}
}
export type MemberContactSnapshot = ReturnType<typeof projectMemberContact>

/**
 * Identité, règles d'adhésion et habillage: tout ce que le formulaire de réglages écrit, sauf les
 * médias. `backgroundImageId` en est absent pour la raison qui vaut partout ici — un cuid ne se
 * lit pas dans un diff — et le journal ne suit pas les médias.
 */
export const eventLabels = {
	id: 'Adresse',
	name: 'Nom',
	description: 'Description',
	email: 'Email',
	phone: 'Téléphone',
	web: 'Site web',
	facebook: 'Facebook',
	instagram: 'Instagram',
	timezone: 'Fuseau horaire',
	location: 'Lieu',
	selfRegisterAllowed: 'Adhésion libre',
	selfSubscribeAllowed: 'Inscription libre',
	selfSubscribeCancelAllowed: 'Annulation libre',
	closeSubscribing: 'Clôture des inscriptions',
	overlapPeriodAllowed: 'Chevauchement toléré (min)',
	userEmailVerifiedRequired: 'Email vérifié requis',
	userAddressRequired: 'Adresse requise',
	userPhoneRequired: 'Téléphone requis',
	userBirthdayRequired: 'Date de naissance requise',
	userAvatarRequired: 'Photo requise',
	backgroundPreset: 'Thème',
	backgroundColor: 'Couleur de fond',
	backgroundBlur: 'Flou du fond',
	backgroundBrightness: 'Brillance du fond',
	backgroundWhiteness: 'Blanchissement du fond',
	backgroundGrain: 'Grain du fond',
} satisfies Partial<Record<keyof Event, string>>

/** Ce que la projection lit, et rien de plus — un `Event` complet le satisfait. */
export type EventSource = Pick<Event, keyof typeof eventLabels>

export function projectEvent(event: EventSource) {
	return {
		...pick(event, keysOf(eventLabels)),
		closeSubscribing: iso(event.closeSubscribing),
		// Réduit à son libellé: les coordonnées ne se lisent pas dans un diff.
		location: event.location?.label ?? null,
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

export const teamLabels = {
	name: 'Nom',
	description: 'Description',
	closeSubscribing: 'Clôture des inscriptions',
	overflowPermitted: 'Sur-inscription autorisée',
	leaders: 'Responsables',
} satisfies Partial<Record<keyof TeamSource, string>>

export function projectTeam(team: TeamSource) {
	return {
		...pick(team, keysOf(teamLabels)),
		closeSubscribing: iso(team.closeSubscribing),
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
