import z from 'zod'
import { zEnumKeys, zJsonOr } from './form'
import type { Prisma } from '@prisma/client'
import { GIFT_CONDITION_MODE } from '$lib/constant'

export const modelGiftCreate = z.object({
	name: z.string().min(2),
	conditionsMode: zEnumKeys(GIFT_CONDITION_MODE).optional(),
}) satisfies z.ZodType<Omit<Prisma.GiftUncheckedCreateInput, 'eventId'>>

export const modelGiftUpdate = z.object({
	name: z.string().min(2).optional(),
	conditionsMode: zEnumKeys(GIFT_CONDITION_MODE).optional(),
}) satisfies z.ZodType<Prisma.GiftUncheckedUpdateInput>

const giftConditionTeamsCreate = z.object({
	type: z.literal('teams'),
	content: z.array(z.string()).transform((v) => JSON.stringify(v)),
	value: z.number(),
}) satisfies z.ZodType<Prisma.GiftConditionCreateWithoutGiftInput>

const giftConditionHoursCreate = z.object({
	type: z.literal('hours'),
	content: z.number().transform((v) => JSON.stringify(v)),
	value: z.number(),
}) satisfies z.ZodType<Prisma.GiftConditionCreateWithoutGiftInput>

const giftConditionPeriodCreate = z.object({
	type: z.literal('period'),
	content: zJsonOr(z.object({ start: z.date(), end: z.date() })).transform((v) =>
		JSON.stringify(v)
	),
	value: z.number(),
}) satisfies z.ZodType<Prisma.GiftConditionCreateWithoutGiftInput>

export const modelGiftCondition = [
	giftConditionTeamsCreate,
	giftConditionHoursCreate,
	giftConditionPeriodCreate,
]
