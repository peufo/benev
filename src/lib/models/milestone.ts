import type { Prisma } from '@prisma/client'
import z from 'zod'
import { zDate } from './form'

export const modelMilestoneCreate = z.object({
	name: z.string().min(2),
	// `InputDateTime` transmet une date ISO dans un champ caché: au schéma de la reconstruire.
	timestamp: zDate,
}) satisfies z.ZodType<Omit<Prisma.MilestoneCreateInput, 'event'>>

export const modelMilestoneUpdate = modelMilestoneCreate.extend({
	id: z.string(),
})
