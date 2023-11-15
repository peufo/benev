import { z, type ZodObj } from '$lib/validation'
import type { Prisma } from '@prisma/client'

const form = {
	id: z.string(),
	path: z.string(),
	title: z.string().min(2),
	content: z.string(),
} satisfies ZodObj<Prisma.PageCreateWithoutEventInput>

export const pageShema = z.object(form)
