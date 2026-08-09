import type { Prisma } from '@prisma/client'
import z from 'zod'
import { PERIOD_MIN_MINUTES, PERIOD_MIN_MS } from '$lib/constant'
import { zConnect, zConnectMany, zDate, zSet } from './form'

export const modelPeriodCreate = z.object({
	maxSubscribe: z.number().min(1),
	// `InputSelect`/`InputMultiSelect` soumettent eux-mêmes l'id de l'item choisi, en clair:
	// un `hidden` pour `team`, une case masquée par étiquette pour `tags[]`.
	team: zConnect,
	tags: zConnectMany,
	// `InputDateTime` transmet une date ISO dans un champ caché: au schéma de la reconstruire.
	start: zDate,
	end: zDate,
}) satisfies z.ZodType<Prisma.PeriodCreateInput>

export const modelPeriodUpdate = modelPeriodCreate.extend({
	id: z.string(),
	tags: zSet,
	maxSubscribe: z.number().min(1).optional(),
})

export const validationPeriod = (
	{ start, end }: { start: Date; end: Date },
	ctx: z.RefinementCtx<{ start: Date; end: Date }>
) => {
	if (end.getTime() - start.getTime() < PERIOD_MIN_MS) {
		ctx.addIssue({
			code: 'custom',
			path: ['end'],
			message: `La période doit durer au moins ${PERIOD_MIN_MINUTES} minutes`,
			fatal: true,
		})
	}
}
