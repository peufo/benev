import type { Prisma } from '@prisma/client'
import z from 'zod'
import { zEnumKeys } from './form'
import { MEMBER_FIELD_TYPE } from '$lib/constant'

export const modelMemberFieldCreate = z.object({
	name: z.string().min(2),
	label: z.string().optional(),
	// Toujours rendus: une case décochée n'envoie rien, d'où le repli sur `false`.
	memberCanWrite: z.boolean().default(false),
	memberCanRead: z.boolean().default(false),
	// Rendus conditionnellement: leur absence doit laisser la valeur en place.
	allCombinations: z.boolean().optional(),
	description: z.string().optional(),
	options: z.string().optional(),
	required: z.boolean().optional(),
	type: zEnumKeys(MEMBER_FIELD_TYPE),
}) satisfies z.ZodType<Omit<Prisma.FieldUncheckedCreateInput, 'eventId' | 'position'>>

export const modelMemberFieldUpdate = modelMemberFieldCreate.extend({
	id: z.string(),
})
