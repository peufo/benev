import z from 'zod'
import { zConnectMany, zDateNullable, zJson, zSet } from './form'

const memberConditionOperator = z.enum([
	'equals',
	'string_contains',
	'string_starts_with',
	'string_ends_with',
	'array_contains',
	'array_starts_with',
	'array_ends_with',
	'lt',
	'lte',
	'gt',
	'gte',
	'not',
])

/** Aussi parsé depuis un corps JSON par `[eventId]/teams/membersAllowed`: reste tel quel. */
export const modelMemberCondition = z.union([
	z.object({ type: z.literal('valided') }),
	z.object({
		type: z.literal('age'),
		args: z.number(),
	}),
	z.object({
		type: z.literal('profile'),
		args: z.object({
			fieldId: z.string(),
			operator: memberConditionOperator,
			expectedValue: z.union([z.string(), z.array(z.string()), z.boolean(), z.number()]),
		}),
	}),
])

export type MemberCondition = (typeof modelMemberCondition)['_output']
export type MemberConditionOperator = (typeof memberConditionOperator)['_output']

export const modelTeam = z.object({
	name: z.string().min(3),
	description: z.string().optional(),
	// `InputLeaders` soumet lui-même les ids, en `leaders[]`, depuis le champ que lui passe
	// `TeamForm`.
	leaders: zConnectMany,
	// Champ rendu conditionnellement (inscription libre): absent, il ne touche à rien.
	closeSubscribing: zDateNullable,
	overflowPermitted: z.boolean().optional(),
	// `MemberConditions` sérialise sa liste dans un champ caché.
	conditions: zJson(z.array(modelMemberCondition)),
})

export const modelTeamUpdate = modelTeam.extend({
	id: z.string(),
	// En mise à jour, la liste transmise remplace l'existante. Optionnelle parce que `TeamForm`
	// ne rend `InputLeaders` qu'aux admins: c'est `updateTeam` qui interprète l'absence, le
	// schéma ne connaît pas le rôle.
	leaders: zSet.optional(),
})
