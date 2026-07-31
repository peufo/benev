import type { Prisma } from '@prisma/client'
import z from 'zod'
import { zConnect, zConnectMany, zDate, zNumber, zSet } from './form'

export const modelPeriodCreate = z.object({
	// Champ brut lié par `bind:value` (il sert aussi à dupliquer la période).
	maxSubscribe: zNumber(1),
	// `InputRelation`/`InputRelations` de fuma 1 ne servent plus qu'à choisir: les ids partent
	// dans des champs cachés, en clair.
	team: zConnect,
	tags: zConnectMany,
	start: zDate,
	end: zDate,
}) satisfies z.ZodType<Prisma.PeriodCreateInput>

export const modelPeriodUpdate = modelPeriodCreate.extend({
	id: z.string(),
	tags: zSet,
	maxSubscribe: zNumber(1).optional(),
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
