import { z, toTuple, type ZodObj } from '$lib/fuma-legacy/validation'
import type { Prisma } from '@prisma/client'
import { EVENT_STATES } from '$lib/constant'
import { isHttpUrl } from '$lib/url'
import { zDateNullable } from './form'

type EventCreateInput = Omit<Prisma.EventUncheckedCreateInput, 'ownerId'>
export type EventUpdateInput = Omit<Prisma.EventUncheckedUpdateInput, 'ownerId'>

/**
 * Le formulaire soumet `null` pour effacer un lieu, là où Prisma attend `DbNull`.
 * La conversion se fait côté action via `jsonOrDbNull` ($lib/server): ce module est
 * importé par des composants Svelte, il doit rester exempt de runtime Prisma.
 */
type FormInput<T> = Omit<T, 'location'> & { location?: PrismaJson.Location | null }

const zLocation = z.object({
	label: z.string().min(1),
	coords: z.object({ lat: z.number(), lon: z.number() }).optional(),
})

/**
 * `InputLocation` transmet toujours son champ, sérialisé: `"null"` quand le lieu est effacé,
 * l'objet JSON sinon. `null` n'étant pas un `RemoteFormInput`, la distinction se fait à la
 * sortie — `null` efface, `undefined` (champ absent) laisse la valeur en place.
 */
const zLocationField = z
	.string()
	.optional()
	.transform((value, ctx): unknown => {
		if (value === undefined) return undefined
		try {
			return JSON.parse(value)
		} catch {
			ctx.addIssue({ code: 'custom', message: 'Lieu invalide' })
			return z.NEVER
		}
	})
	.pipe(zLocation.nullish())

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
	location: zLocationField,
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
	// Ces cases sont toutes rendues: leur absence signifie bien « décochée ».
	selfRegisterAllowed: z.boolean().default(false),
	selfSubscribeAllowed: z.boolean().default(false),
	selfSubscribeCancelAllowed: z.boolean().default(false),
	// Ce champ-là n'apparaît que si l'inscription libre est activée: absent, il ne touche à rien.
	closeSubscribing: zDateNullable,
	userEmailVerifiedRequired: z.boolean().default(false),
	userAddressRequired: z.boolean().default(false),
	userPhoneRequired: z.boolean().default(false),
	userBirthdayRequired: z.boolean().default(false),
	userAvatarRequired: z.boolean().default(false),
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

// Le schéma correspondant vit dans `[eventId]/admin/theme/theme.remote.ts`: ses champs sont
// des `<input>` bruts liés au store d'aperçu, donc convertis depuis la chaîne au cas par cas.
