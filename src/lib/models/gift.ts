import { z, toTuple, type ZodObj } from 'fuma/validation'
import type { Prisma } from '@prisma/client'
import { GIFT_CONDITION_MODE } from '$lib/constant'

export const modelGiftCreate = {
	name: z.string().min(2),
	conditionsMode: z.enum(toTuple(GIFT_CONDITION_MODE)).optional(),
} satisfies ZodObj<Omit<Prisma.GiftUncheckedCreateInput, 'eventId'>>

export const modelGiftUpdate = {
	name: z.string().min(2).optional(),
	conditionsMode: z.enum(toTuple(GIFT_CONDITION_MODE)).optional(),
} satisfies ZodObj<Prisma.GiftUncheckedUpdateInput>

const giftConditionTeamsCreate = {
	type: z.literal('teams'),
	content: z.jsonArray(z.string()).transform((v) => JSON.stringify(v)),
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

export const modelGiftCondition = [
	giftConditionTeamsCreate,
	giftConditionHoursCreate,
	giftConditionPeriodCreate,
]
