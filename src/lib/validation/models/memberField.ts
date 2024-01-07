import { z, toTuple, type ZodObj } from '$lib/validation'
import { type Prisma, FieldType } from '@prisma/client'

export const memberFieldCreate = {
	name: z.string().min(2),
	memberCanWrite: z.boolean(),
	memberCanRead: z.boolean(),
	allCombinations: z.boolean().optional(),
	description: z.string().optional(),
	options: z.string().optional(),
	required: z.boolean().optional(),
	type: z.enum(toTuple(FieldType)),
} satisfies ZodObj<Omit<Prisma.FieldUncheckedCreateInput, 'eventId'>>

export const memberFieldUpdate = {
	...memberFieldCreate,
	id: z.string(),
}
