import { z, type ZodObj } from 'fuma/validation'
import type { Prisma } from '@prisma/client'

export const modelViewCreate = {
	name: z.string().min(2),
	query: z.string().min(2),
	key: z.string(),
} satisfies ZodObj<Omit<Prisma.ViewCreateInput, 'event' | 'author'>>
