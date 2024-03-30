import { PAGE_TYPE } from '$lib/constant'
import { toTuple, z, type ZodObj } from '$lib/validation'
import type { Prisma } from '@prisma/client'

export const pageUpdate = {
	id: z.string(),
	type: z.enum(toTuple(PAGE_TYPE)),
	path: z.string().optional(),
	title: z.string().min(2),
	content: z.string(),
} satisfies ZodObj<Prisma.PageUpdateWithoutEventInput>
