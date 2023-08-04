import z from 'zod'
import type { Prisma } from '@prisma/client'
import type { ZodObj } from './utils'

export type EventCreateForm = Omit<Prisma.PeriodCreateInput, 'team'>

const periodForm = {
	maxSubscribe: z.number().min(1),
	start: z.date(),
	end: z.date(),
} satisfies ZodObj<EventCreateForm>

export const periodShema = z.object(periodForm)
