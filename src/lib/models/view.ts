import z from 'zod'
import type { Prisma } from '@prisma/client'

export const modelViewCreate = z.object({
	name: z.string().min(2),
	query: z.string().min(2),
	key: z.string(),
}) satisfies z.ZodType<Omit<Prisma.ViewCreateInput, 'event' | 'author'>>
