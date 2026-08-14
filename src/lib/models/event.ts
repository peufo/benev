import z from 'zod'
import type { Prisma } from '@prisma/client'
import { EVENT_STATES } from '$lib/constant'
import { isHttpUrl } from '$lib/url'
import { zDateNullable, zEnumKeys } from './form'
import { zMediaId } from './media'

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

export const modelEventUpdate = z.object({
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
}) satisfies z.ZodType<FormInput<EventUpdateInput>>

export const modelEventCreate = modelEventUpdate.extend({
	tier: z.enum(['basic', 'standard', 'premium', 'pro']),
}) satisfies z.ZodType<FormInput<EventCreateInput>>

export const modelEventState = z.object({
	state: zEnumKeys(EVENT_STATES).optional(),
}) satisfies z.ZodType<EventUpdateInput>

export const modelEventAdhesion = z.object({
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
}) satisfies z.ZodType<EventUpdateInput>

export type EventTheme = Pick<
	EventCreateInput,
	| 'backgroundBlur'
	| 'backgroundBrightness'
	| 'backgroundColor'
	| 'backgroundImageId'
	| 'backgroundWhiteness'
	| 'cardOpacity'
>

/**
 * Affiche et logo se choisissent dans la médiathèque de l'évènement, qui n'existe pas avant
 * lui: ces champs n'apparaissent donc qu'en modification, jamais à la création.
 */
export const modelEventMedia = z.object({
	posterId: zMediaId,
	logoId: zMediaId,
}) satisfies z.ZodType<EventUpdateInput>

/**
 * Ces champs-là sont liés au store d'aperçu et n'ont pas de `field`: leur valeur arrive donc en
 * chaîne, et `z.coerce.number()` n'est pas une entrée `RemoteFormInput` (voir l'en-tête de
 * `$lib/models`).
 */
export const modelEventTheme = z.object({
	backgroundColor: z.string().optional(),
	backgroundImageId: zMediaId,
	// Ces trois-là n'existent qu'avec une image de fond: absents, ils ne touchent à rien.
	backgroundBlur: z.string().transform(Number).optional(),
	backgroundBrightness: z.string().transform(Number).optional(),
	backgroundWhiteness: z.string().transform(Number).optional(),
	cardOpacity: z.string().transform(Number).optional(),
}) satisfies z.ZodType<EventUpdateInput>

/**
 * Le formulaire unique de `/[eventId]/admin/settings`: identité, adhésion et thème en une seule
 * soumission, les trois n'écrivant jamais qu'une même ligne `Event`. Les images s'ajoutent au
 * point d'appel, comme pour `createEvent`.
 */
export const modelEventSettings = modelEventUpdate
	.extend(modelEventAdhesion.shape)
	.extend(modelEventMedia.shape)
	.extend(modelEventTheme.shape)
