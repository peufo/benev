import { toTuple, z, type ZodObj } from 'fuma/validation'
import { PAGE_TYPE } from '$lib/constant'
import type { Prisma } from '@prisma/client'

export const modelPageUpdate = {
	id: z.string(),
	type: z.enum(toTuple(PAGE_TYPE)),
	path: z.string().optional(),
	title: z.string().min(2),
	content: z.string(),
} satisfies ZodObj<Prisma.PageUpdateWithoutEventInput>
