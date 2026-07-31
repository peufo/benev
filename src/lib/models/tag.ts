import z from 'zod'
import type { Prisma } from '@prisma/client'

export const modelTagCreate = z.object({
	name: z.string().min(2),
	color: z.string(),
}) satisfies z.ZodType<Omit<Prisma.TagCreateInput, 'event'>>

export const modelTagUpdate = modelTagCreate.extend({
	id: z.string(),
})
