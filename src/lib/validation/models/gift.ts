import { z, toTuple, type ZodObj } from '$lib/validation'
import type { Prisma, GiftConditionsMode, GiftConditionType } from '@prisma/client'

export const conditionsModeLabel: Record<GiftConditionsMode, string> = {
	sum: 'Somme des conditions',
	highest: 'Plus haute condition',
}

export const conditionTypeOptions: Record<GiftConditionType, string> = {
	teams: `Doit être inscrit à l'un de ces secteurs`,
	hours: `Doit avoir un minimum d'heure de travail de`,
	period: `Doit travailer durant la période de`,
}

export const giftCreate = {
	name: z.string().min(2),
	conditionsMode: z.enum(toTuple(conditionsModeLabel)).optional(),
} satisfies ZodObj<Omit<Prisma.GiftUncheckedCreateInput, 'eventId'>>

export const giftUpdate = {
	name: z.string().min(2).optional(),
	conditionsMode: z.enum(toTuple(conditionsModeLabel)).optional(),
} satisfies ZodObj<Prisma.GiftUncheckedUpdateInput>

const giftConditionTeamsCreate = {
	type: z.literal('teams'),
	content: z.array(z.string()).transform((v) => JSON.stringify(v)),
	value: z.number(),
} satisfies ZodObj<Prisma.GiftConditionCreateWithoutGiftInput>

const giftConditionHoursCreate = {
	type: z.literal('hours'),
	content: z.number().transform((v) => JSON.stringify(v)),
	value: z.number(),
} satisfies ZodObj<Prisma.GiftConditionCreateWithoutGiftInput>

const giftConditionPeriodCreate = {
	type: z.literal('period'),
	content: z.json({ start: z.date(), end: z.date() }).transform((v) => JSON.stringify(v)),
	value: z.number(),
} satisfies ZodObj<Prisma.GiftConditionCreateWithoutGiftInput>

export const createGiftCondition = [
	giftConditionTeamsCreate,
	giftConditionHoursCreate,
	giftConditionPeriodCreate,
]
