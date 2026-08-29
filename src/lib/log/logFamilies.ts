import type { LogType } from '@prisma/client'

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
			'member_decline',
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
