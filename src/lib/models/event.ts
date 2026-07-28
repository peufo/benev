import { z, toTuple, type ZodObj } from 'fuma/validation'
import type { Prisma } from '@prisma/client'
import { EVENT_STATES } from '$lib/constant'
import { isHttpUrl } from '$lib/url'

export type EventCreateInput = Omit<Prisma.EventUncheckedCreateInput, 'ownerId'>
export type EventUpdateInput = Omit<Prisma.EventUncheckedUpdateInput, 'ownerId'>

/**
 * Le formulaire soumet `null` pour effacer un lieu, là où Prisma attend `DbNull`.
 * La conversion se fait côté action via `jsonOrDbNull` ($lib/server): ce module est
 * importé par des composants Svelte, il doit rester exempt de runtime Prisma.
 */
type FormInput<T> = Omit<T, 'location'> & { location?: PrismaJson.Location | null }

// .url() accepte n'importe quel schéma (javascript:, data:, …), or ces liens sont
// rendus tels quels dans un href par FooterLink: on restreint à http(s)
const httpUrl = z
	.string()
	.url()
	.refine(isHttpUrl, 'Le lien doit commencer par https://')
	.optional()
	.or(z.string().max(0))

export const modelEventUpdate = {
	id: z.string().toLowerCase().min(3),
	name: z.string().min(3),
	description: z.string().optional(),
	icon: z.string().optional(),
	web: httpUrl,
	facebook: httpUrl,
	instagram: httpUrl,
	email: z.string().email().optional().or(z.string().max(0)),
	phone: z.string().optional(),
	// `null` = le lieu a été effacé, `undefined` = champ absent, valeur inchangée
	location: z
		.json({
			label: z.string().min(1),
			coords: z.object({ lat: z.number(), lon: z.number() }).optional(),
		})
		.nullish(),
	timezone: z.string().optional(),
} satisfies ZodObj<FormInput<EventUpdateInput>>

export const modelEventCreate = {
	...modelEventUpdate,
	tier: z.enum(['basic', 'standard', 'premium', 'pro']),
} satisfies ZodObj<FormInput<EventCreateInput>>

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
	| 'backgroundImageId'
	| 'backgroundWhiteness'
	| 'cardOpacity'
>

export const modelEventTheme = {
	backgroundColor: z.string().optional(),
	backgroundBlur: z.number().optional(),
	backgroundBrightness: z.number().optional(),
	backgroundImageId: z.string().nullish(),
	backgroundWhiteness: z.number().optional(),
	cardOpacity: z.number().optional(),
} satisfies ZodObj<EventTheme>
