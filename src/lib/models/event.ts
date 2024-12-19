import { z, toTuple, type ZodObj } from 'fuma/validation'
import type { Prisma } from '@prisma/client'
import { EVENT_STATES } from '$lib/constant'

export type EventCreateInput = Omit<Prisma.EventCreateInput, 'owner'>
export type EventUpdateInput = Omit<Prisma.EventUpdateInput, 'owner'>

export const modelEventCreate = {
	id: z.string().toLowerCase().min(3),
	name: z.string().min(3),
	description: z.string().optional(),
	icon: z.string().optional(),
	web: z.string().url().optional().or(z.string().max(0)),
	facebook: z.string().url().optional().or(z.string().max(0)),
	instagram: z.string().url().optional().or(z.string().max(0)),
	email: z.string().email().optional().or(z.string().max(0)),
	phone: z.string().optional(),
	address: z.string().optional(),
} satisfies ZodObj<EventCreateInput>

export const modelEventUpdate = {
	...modelEventCreate,
	id: z.string(),
	name: z.string().min(3).optional(),
} satisfies ZodObj<EventUpdateInput>

export const modelEventState = {
	state: z.enum(toTuple(EVENT_STATES)).optional(),
} satisfies ZodObj<EventUpdateInput>

export const modelEventSettings = {
	selfRegisterAllowed: z.boolean(),
	selfSubscribeAllowed: z.boolean(),
	selfSubscribeCancelAllowed: z.boolean(),
	closeSubscribing: z.date().optional().nullable(),
	userEmailVerifiedRequired: z.boolean(),
	userAddressRequired: z.boolean(),
	userPhoneRequired: z.boolean(),
	userBirthdayRequired: z.boolean(),
	userAvatarRequired: z.boolean(),
	overlapPeriodAllowed: z.number(),
} satisfies ZodObj<EventUpdateInput>

export type EventTheme = Pick<
	EventCreateInput,
	| 'backgroundBlur'
	| 'backgroundBrightness'
	| 'backgroundColor'
	| 'backgroundPoster'
	| 'backgroundWhiteness'
	| 'cardOpacity'
>

export const modelEventTheme = {
	backgroundColor: z.string().optional(),
	backgroundBlur: z.number().optional(),
	backgroundBrightness: z.number().optional(),
	backgroundPoster: z.boolean().optional(),
	backgroundWhiteness: z.number().optional(),
	cardOpacity: z.number().optional(),
} satisfies ZodObj<EventTheme>
