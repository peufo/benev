import type { Prisma } from '@prisma/client'
import z from 'zod'
import { zConnect, zConnectMany, zDate, zSet } from './form'

export const modelPeriodCreate = z.object({
	maxSubscribe: z.number().min(1),
	// `InputSelect`/`InputMultiSelect` soumettent eux-mêmes l'id de l'item choisi, en clair:
	// un `hidden` pour `team`, une case masquée par étiquette pour `tags[]`.
	team: zConnect,
	tags: zConnectMany,
	start: zDate,
	end: zDate,
}) satisfies z.ZodType<Prisma.PeriodCreateInput>

export const modelPeriodUpdate = modelPeriodCreate.extend({
	id: z.string(),
	tags: zSet,
	maxSubscribe: z.number().min(1).optional(),
})

/**
 * Règle inter-champs, appliquée par `.superRefine()` sur l'objet complet. `fatal` empêche les
 * refinements suivants de tourner sur des dates incohérentes.
 */
export const validationPeriod = (
	{ start, end }: { start: Date; end: Date },
	ctx: z.RefinementCtx<{ start: Date; end: Date }>
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
			code: 'custom',
			path: ['end'],
			message: 'Doit être après le début',
			fatal: true,
		})
	}
}
