import type { LogType } from '@prisma/client'
import type { EventSnapshot, MemberContactSnapshot, TeamSnapshot } from './logProject'

/**
 * Les familles servent au filtre du fil: vingt cases à cocher seraient illisibles, et le lecteur
 * cherche « les inscriptions » ou « la configuration », pas un type précis.
 */
export const LOG_FAMILIES = {
	subscribe: {
		label: 'Inscriptions',
		types: [
			'subscribe_create',
			'subscribe_state',
			'subscribe_delete',
			'subscribe_absent',
		] satisfies LogType[],
	},
	member: {
		label: 'Adhésion',
		types: [
			'member_invite',
			'member_join',
			'member_delete',
			'member_update',
			'member_role',
			'member_validated',
		] satisfies LogType[],
	},
	config: {
		label: 'Configuration',
		types: [
			'event_create',
			'event_state',
			'event_update',
			'team_create',
			'team_update',
			'team_delete',
			'period_create',
			'period_delete',
		] satisfies LogType[],
	},
	email: {
		label: 'Emails',
		types: ['email_sent', 'email_failed'] satisfies LogType[],
	},
	note: {
		label: 'Notes',
		types: ['note_create'] satisfies LogType[],
	},
} as const

export type LogFamily = keyof typeof LOG_FAMILIES

/** Les clés sous la forme qu'exige `z.enum`: un tuple non vide. */
export const LOG_FAMILY_KEYS = Object.keys(LOG_FAMILIES) as [LogFamily, ...LogFamily[]]

export const LOG_TYPES_FOR_EVENT: LogType[] = Object.values(LOG_FAMILIES).flatMap(({ types }) => [
	...types,
])

export const memberContactLabels: Record<keyof MemberContactSnapshot, string> = {
	firstName: 'Prénom',
	lastName: 'Nom',
	email: 'Email',
	phone: 'Téléphone',
	birthday: 'Date de naissance',
	street: 'Rue',
	zipCode: 'NPA',
	city: 'Localité',
}

export const eventLabels: Record<keyof EventSnapshot, string> = {
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
}

export const teamLabels: Record<keyof TeamSnapshot, string> = {
	name: 'Nom',
	description: 'Description',
	closeSubscribing: 'Clôture des inscriptions',
	overflowPermitted: 'Sur-inscription autorisée',
	leaders: 'Responsables',
}
