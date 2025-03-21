import { z, type ZodObj } from 'fuma/validation'
import type { Prisma } from '@prisma/client'

export const modelTagCreate = {
	name: z.string().min(2),
	color: z.string(),
} satisfies ZodObj<Omit<Prisma.TagCreateInput, 'event'>>

export const modelTagUpdate = {
	...modelTagCreate,
	id: z.string(),
}
