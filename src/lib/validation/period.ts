import { z, type ZodObj } from '$lib/validation'
import type { SuperRefinement } from 'zod'
import type { Prisma } from '@prisma/client'

type PeriodCreateForm = Omit<Prisma.PeriodCreateInput, 'team'>

const periodForm = {
	maxSubscribe: z.number().min(1),
	start: z.date(),
	end: z.date(),
} satisfies ZodObj<PeriodCreateForm>

const validation: SuperRefinement<{ start: Date; end: Date }> = ({ start, end }, ctx) => {
	if (start.getTime() > end.getTime()) {
		ctx.addIssue({
			code: 'invalid_date',
			path: ['start'],
			message: 'Doit être avant la fin',
			fatal: true,
		})
		ctx.addIssue({
			code: 'invalid_date',
			path: ['end'],
			message: 'Doit être après le début',
			fatal: true,
		})
	}
}

export const periodShema = z.object(periodForm).superRefine(validation)
export const periodShemaUpdate = z.object({ id: z.string(), ...periodForm }).superRefine(validation)
