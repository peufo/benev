import type { Prisma } from '@prisma/client'
import type { ShapeOf } from 'fuma'
import { toTuple } from '$lib/fuma-legacy/validation'
import z from 'zod'
import { MEMBER_FIELD_TYPE } from '$lib/constant'

export const modelMemberFieldCreate = {
	name: z.string().min(2),
	label: z.string().optional(),
	// Toujours transmis, par un champ caché piloté par le groupe de cases « Les membres peuvent ».
	memberCanWrite: z.boolean().default(false),
	memberCanRead: z.boolean().default(false),
	// Rendus conditionnellement: leur absence doit laisser la valeur en place.
	allCombinations: z.boolean().optional(),
	description: z.string().optional(),
	options: z.string().optional(),
	required: z.boolean().optional(),
	type: z.enum(toTuple(MEMBER_FIELD_TYPE)),
} satisfies ShapeOf<Omit<Prisma.FieldUncheckedCreateInput, 'eventId' | 'position'>>

export const modelMemberFieldUpdate = {
	...modelMemberFieldCreate,
	id: z.string(),
}
