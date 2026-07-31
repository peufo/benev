import z from 'zod'
import { zEnumKeys } from './form'
import { PAGE_TYPE } from '$lib/constant'
import type { Prisma } from '@prisma/client'

export const modelPageUpdate = z.object({
	id: z.string(),
	type: zEnumKeys(PAGE_TYPE),
	path: z.string().optional(),
	title: z.string().min(2),
	content: z.string(),
}) satisfies z.ZodType<Prisma.PageUpdateWithoutEventInput>
