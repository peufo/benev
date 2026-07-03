import { z, type ZodObj } from 'fuma/validation'
import type { Prisma } from '@prisma/client'

export const modelMilestoneCreate = {
	name: z.string().min(2),
	timestamp: z.date(),
} satisfies ZodObj<Omit<Prisma.MilestoneCreateInput, 'event'>>

export const modelMilestoneUpdate = {
	...modelMilestoneCreate,
	id: z.string(),
}
