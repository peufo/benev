import { z, type ZodObj } from '$lib/validation'
import type { Prisma } from '@prisma/client'

export const viewCreate = {
	name: z.string().min(2),
	query: z.string().min(2),
	key: z.string(),
} satisfies ZodObj<Omit<Prisma.ViewCreateInput, 'event' | 'author'>>
