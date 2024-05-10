import type { Prisma } from '@prisma/client'
import { z, type ZodObj } from 'fuma/validation'

type TeamShemaCreate = Omit<Prisma.TeamCreateInput, 'event'>
type TeamShemaUpdate = Omit<Prisma.TeamUpdateInput, 'event'>

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
export const modelMemberCondition = z.union([
	z.object({ type: z.literal('valided') }),
	z.object({
		type: z.literal('age'),
		args: z.number().transform(String),
	}),
	z.object({
		type: z.literal('profile'),
		args: z.object({
			fieldId: z.string(),
			operator: memberConditionOperator,
			expectedValue: z.union([z.string(), z.arrayRaw(z.string()), z.boolean(), z.number()]),
		}),
	}),
])

export type MemberCondition = (typeof modelMemberCondition)['_output']
export type MemberConditionOperator = (typeof memberConditionOperator)['_output']

export const modelTeam = {
	name: z.string().min(3),
	description: z.string().optional(),
	leaders: z.relations.connect,
	closeSubscribing: z.date().optional(),
	conditions: z.array(modelMemberCondition),
} satisfies ZodObj<TeamShemaCreate>

export const modelTeamUpdate = {
	...modelTeam,
	leaders: z.relations.set,
} satisfies ZodObj<TeamShemaUpdate>
