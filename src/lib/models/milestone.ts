import type { Prisma } from '@prisma/client'
import type { ShapeOf } from 'fuma'
import z from 'zod'
import { zDate } from './form'

export const modelMilestoneCreate = {
	name: z.string().min(2),
	// `InputTzDateTime` transmet une date ISO: la conversion se fait dans le schéma, là où
	// `parseFormData` la faisait à partir du jeton `USE_COERCE_DATE`.
	timestamp: zDate,
} satisfies ShapeOf<Omit<Prisma.MilestoneCreateInput, 'event'>>

export const modelMilestoneUpdate = {
	...modelMilestoneCreate,
	id: z.string(),
}
