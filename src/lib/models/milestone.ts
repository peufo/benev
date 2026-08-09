import type { Prisma } from '@prisma/client'
import z from 'zod'
import { zDate } from './form'

export const modelMilestoneCreate = z.object({
	name: z.string().min(2),
	// `InputDateTime` transmet une date ISO: la conversion se fait dans le schéma, là où
	// `parseFormData` la faisait à partir du jeton `USE_COERCE_DATE`.
	timestamp: zDate,
}) satisfies z.ZodType<Omit<Prisma.MilestoneCreateInput, 'event'>>

export const modelMilestoneUpdate = modelMilestoneCreate.extend({
	id: z.string(),
})
