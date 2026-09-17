import z from 'zod'
import { zEnumKeys } from './form'
import { PAGE_STATES, PAGE_TYPE } from '$lib/constant'
import type { Prisma } from '@prisma/client'

export const modelPageUpdate = z.object({
	id: z.string(),
	type: zEnumKeys(PAGE_TYPE),
	path: z.string().optional(),
	title: z.string().min(2),
	content: z.string(),
}) satisfies z.ZodType<Prisma.PageUpdateWithoutEventInput>

/** Le statut a sa propre porte: `modelPageUpdate` ne le porte pas, changer d'état a ses effets. */
export const modelPageState = z.object({
	id: z.string(),
	state: zEnumKeys(PAGE_STATES),
})
