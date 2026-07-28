import { z, type ZodObj, type SuperRefinement } from '$lib/fuma-legacy/validation'
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
	tags: z.relations.set.optional(),
	maxSubscribe: z.number().min(1).optional(),
}

export const validationPeriod: SuperRefinement<{ start: Date; end: Date }> = (
	{ start, end },
	ctx
) => {
	if (start.getTime() > end.getTime()) {
		ctx.addIssue({
			// zod 4 a retiré le code `invalid_date`; une règle métier inter-champs
			// relève de `custom`.
			code: 'custom',
			path: ['start'],
			message: 'Doit être avant la fin',
			fatal: true,
		})
		ctx.addIssue({
			// zod 4 a retiré le code `invalid_date`; une règle métier inter-champs
			// relève de `custom`.
			code: 'custom',
			path: ['end'],
			message: 'Doit être après le début',
			fatal: true,
		})
	}
}
