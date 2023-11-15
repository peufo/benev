import z from 'zod'
import type { Prisma } from '@prisma/client'
import type { ZodObj } from './utils'

const form = {
	id: z.string(),
	path: z.string(),
	title: z.string().min(2),
	content: z.string(),
} satisfies ZodObj<Prisma.PageCreateWithoutEventInput>

export const pageShema = z.object(form)
