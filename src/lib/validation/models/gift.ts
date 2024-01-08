import { z, toTuple, type ZodObj } from '$lib/validation'
import type { Prisma } from '@prisma/client'
import { GIFT_CONDITION_MODE } from '$lib/constant'

export const giftCreate = {
	name: z.string().min(2),
	conditionsMode: z.enum(toTuple(GIFT_CONDITION_MODE)).optional(),
} satisfies ZodObj<Omit<Prisma.GiftUncheckedCreateInput, 'eventId'>>

export const giftUpdate = {
	name: z.string().min(2).optional(),
	conditionsMode: z.enum(toTuple(GIFT_CONDITION_MODE)).optional(),
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
