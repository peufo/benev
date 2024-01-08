import { z, toTuple, type ZodObj } from '$lib/validation'
import type { Prisma } from '@prisma/client'
import { EVENT_STATES } from '$lib/constant'

export type EventCreateInput = Omit<Prisma.EventCreateInput, 'owner'>
export type EventUpdateInput = Omit<Prisma.EventUpdateInput, 'owner'>

export const eventCreate = {
	id: z.string().toLowerCase().min(3),
	name: z.string().min(3),
	description: z.string().optional(),
	icon: z.string().optional(),
	web: z.string().url().optional().or(z.string().max(0)),
	email: z.string().email().optional().or(z.string().max(0)),
	phone: z.string().optional(),
	address: z.string().optional(),
} satisfies ZodObj<EventCreateInput>

export const eventUpdate = {
	...eventCreate,
	name: z.string().min(3).optional(),
} satisfies ZodObj<EventUpdateInput>

export const eventState = {
	state: z.enum(toTuple(EVENT_STATES)).optional(),
} satisfies ZodObj<EventUpdateInput>

export const eventSettings = {
	selfRegisterAllowed: z.boolean(),
	selfSubscribeAllowed: z.boolean(),
	closeSubscribing: z.dateOptional(),
} satisfies ZodObj<EventUpdateInput>

export const eventMemberSettings = {
	userAddressRequired: z.boolean(),
	userPhoneRequired: z.boolean(),
	userBirthdayRequired: z.boolean(),
	userAvatarRequired: z.boolean(),
} satisfies ZodObj<EventUpdateInput>
