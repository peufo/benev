import type { Prisma } from '@prisma/client'
import { z, type ZodObj } from '$lib/validation'
import * as zod from 'zod'

type TeamShemaCreate = Omit<Prisma.TeamCreateInput, 'event'>
type TeamShemaUpdate = Omit<Prisma.TeamUpdateInput, 'event'>

const teamConditionOperator = z.enum([
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
export const teamConditionModel = z.union([
	z.object({ type: z.literal('valided') }),
	z.object({
		type: z.literal('age'),
		args: z.number().transform(String),
	}),
	z.object({
		type: z.literal('profile'),
		args: z.object({
			fieldId: z.string(),
			operator: teamConditionOperator,
			expectedValue: z.union([z.string(), zod.array(z.string()), z.boolean(), z.number()]),
		}),
	}),
])

export type TeamCondition = zod.infer<typeof teamConditionModel>
export type TeamConditionOperator = zod.infer<typeof teamConditionOperator>

export const teamCreate = {
	name: z.string().min(3),
	description: z.string().optional(),
	leaders: z.relations.connect,
	closeSubscribing: z.dateOptional(),
	conditions: z.array(teamConditionModel),
} satisfies ZodObj<TeamShemaCreate>

export const teamUpdate = {
	...teamCreate,
	leaders: z.relations.set,
} satisfies ZodObj<TeamShemaUpdate>
