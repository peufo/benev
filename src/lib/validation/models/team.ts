import type { Prisma } from '@prisma/client'
import { z, type ZodObj } from '$lib/validation'
import * as zod from 'zod'

type TeamShemaCreate = Omit<Prisma.TeamCreateInput, 'event'>
type TeamShemaUpdate = Omit<Prisma.TeamUpdateInput, 'event'>

const conditionModel = z.union([
	z.object({ type: z.literal('valided') }),
	z.object({
		type: z.literal('age'),
		args: z.number(),
	}),
	z.object({
		type: z.literal('profile'),
		args: z.object({
			fieldId: z.string(),
			operator: z.enum(['equal', 'contains', 'gt', 'lt']),
		}),
	}),
])

export type TeamCondition = zod.infer<typeof conditionModel>

export const teamCreate = {
	name: z.string().min(3),
	description: z.string().optional(),
	leaders: z.relations('connect'),
	closeSubscribing: z.dateOptional(),
	conditions: z.array(conditionModel).transform((v) => JSON.stringify(v)),
} satisfies ZodObj<TeamShemaCreate>

export const teamUpdate = {
	...teamCreate,
	leaders: z.relations('set'),
} satisfies ZodObj<TeamShemaUpdate>
