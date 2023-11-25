import { z, toTuple, type ZodObj } from '$lib/validation'
import { type Prisma, GiftConditionsMode } from '@prisma/client'

export let conditionsModeLabel: Record<GiftConditionsMode, string> = {
	sum: 'Somme des conditions',
	highest: 'Plus haute condition',
}

export const giftCreate = {
	name: z.string().min(2),
	conditionsMode: z.enum(toTuple(GiftConditionsMode)).optional(),
} satisfies ZodObj<Omit<Prisma.GiftUncheckedCreateInput, 'eventId'>>

export const giftUpdate = {
	name: z.string().min(2).optional(),
	conditionsMode: z.enum(toTuple(GiftConditionsMode)).optional(),
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
