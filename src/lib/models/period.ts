import { z, type ZodObj, type SuperRefinement } from 'fuma/validation'
import type { Prisma } from '@prisma/client'

export const modelPeriodCreate = {
	maxSubscribe: z.number().min(1),
	team: z.relation.connect,
	tags: z.relations.connect,
	start: z.date(),
	end: z.date(),
} satisfies ZodObj<Prisma.PeriodCreateInput>

export const modelPeriodUpdate = {
	...modelPeriodCreate,
	id: z.string(),
	tags: z.relations.set,
	maxSubscribe: z.number().min(1).optional(),
}

export const validationPeriod: SuperRefinement<{ start: Date; end: Date }> = (
	{ start, end },
	ctx
) => {
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
