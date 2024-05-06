import { z, toTuple, type ZodObj } from 'fuma/validation'
import type { Prisma } from '@prisma/client'
import { MEMBER_FIELD_TYPE } from '$lib/constant'

export const modelMemberFieldCreate = {
	name: z.string().min(2),
	label: z.string().optional(),
	memberCanWrite: z.boolean(),
	memberCanRead: z.boolean(),
	allCombinations: z.boolean().optional(),
	description: z.string().optional(),
	options: z.string().optional(),
	required: z.boolean().optional(),
	type: z.enum(toTuple(MEMBER_FIELD_TYPE)),
} satisfies ZodObj<Omit<Prisma.FieldUncheckedCreateInput, 'eventId'>>

export const modelMemberFieldUpdate = {
	...modelMemberFieldCreate,
	id: z.string(),
}
