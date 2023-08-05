import z from 'zod'
import type { Prisma } from '@prisma/client'
import type { ZodObj } from './utils'

type PeriodCreateForm = Omit<Prisma.PeriodCreateInput, 'team'>

const periodForm = {
	maxSubscribe: z.number().min(1),
	start: z.date(),
	end: z.date(),
} satisfies ZodObj<PeriodCreateForm>

const periodFormUpdate = {
	id: z.string(),
	...periodForm,
} satisfies ZodObj<PeriodCreateForm>

export const periodShema = z.object(periodForm)
export const periodShemaUpdate = z.object(periodFormUpdate)
