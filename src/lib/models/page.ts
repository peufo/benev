import z from 'zod'
import { zEnumKeys } from './form'
import { PAGE_STATES, PAGE_TYPE } from '$lib/constant'
import type { Prisma } from '@prisma/client'

export const modelPageUpdate = z.object({
	id: z.string(),
	type: zEnumKeys(PAGE_TYPE),
	state: zEnumKeys(PAGE_STATES),
	path: z.string().optional(),
	title: z.string().min(2),
	content: z.string(),
}) satisfies z.ZodType<Prisma.PageUpdateWithoutEventInput>
