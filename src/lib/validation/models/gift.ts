import { z, toTuple, type ZodObj } from '$lib/validation'
import { type Prisma, GiftConditionsMode } from '@prisma/client'

export let conditionsModeLabel: Record<GiftConditionsMode, string> = {
	sum: 'Somme des conditions',
	highest: 'Plus haute condition',
}

export const createGift = {
	name: z.string().min(2),
	conditionsMode: z.enum(toTuple(GiftConditionsMode)),
} satisfies ZodObj<Prisma.GiftCreateInput>

const createConditionTeams = {
	type: z.literal('teams'),
	content: z.array(z.string()).transform((v) => JSON.stringify(v)),
	value: z.number(),
} satisfies ZodObj<Prisma.GiftConditionCreateWithoutGiftInput>

const createConditionHours = {
	type: z.literal('hours'),
	content: z.number().transform((v) => JSON.stringify(v)),
	value: z.number(),
} satisfies ZodObj<Prisma.GiftConditionCreateWithoutGiftInput>

const createConditionPeriod = {
	type: z.literal('period'),
	content: z.json({ start: z.date(), end: z.date() }).transform((v) => JSON.stringify(v)),
	value: z.number(),
} satisfies ZodObj<Prisma.GiftConditionCreateWithoutGiftInput>

export const createGiftCondition = [
	createConditionTeams,
	createConditionHours,
	createConditionPeriod,
]
