import { zodCoerceJson } from 'fuma'
import z from 'zod'

/**
 * Helpers zod partagés: conversions entre ce qu'un formulaire (ou une URL) transmet et ce que
 * Prisma attend.
 *
 * `form()` contraint l'ENTRÉE du schéma à `RemoteFormInput` — chaîne, nombre, booléen, `File`,
 * ou objet/tableau de ceux-ci. La plupart de ce qui suit part donc d'une chaîne (ou d'un tableau
 * de chaînes) et produit la forme métier. Voir l'en-tête de `$lib/models` pour la démarche.
 */

/**
 * `z.enum` sur les **clés** d'un registre applicatif. `z.enum(RECORD)` ne conviendrait pas: zod
 * lit les valeurs, or nos registres associent la clé à un descriptif (`{ label, icon }`) ou à un
 * libellé français. Le retour reste littéral, donc `z.infer` donne bien l'union des clés.
 */
export function zEnumKeys<Registry extends Record<string, unknown>>(registry: Registry) {
	type Key = keyof Registry & string
	return z.enum(Object.keys(registry) as [Key, ...Key[]])
}

/**
 * Une valeur qui arrive soit déjà désérialisée, soit en JSON sérialisé — le cas d'un paramètre
 * d'URL ou d'un corps de requête où le même champ peut prendre les deux formes.
 */
export function zJsonOr<Schema extends z.ZodType>(schema: Schema) {
	return z.union([schema, zodCoerceJson.pipe(schema)])
}

/**
 * Champ numérique **brut**, c'est-à-dire un `<input type="number">` écrit à la main plutôt que
 * l'`InputNumber` de fuma. Ce dernier passe par `field.as('number')`, qui préfixe le `name` de
 * `n:` et fait convertir SvelteKit lui-même: dans ce cas, `z.number()` convient directement.
 */
export function zNumber(min?: number) {
	const number = min === undefined ? z.number() : z.number().min(min)
	return z.string().transform(Number).pipe(number)
}

/** `<input type="date">` transmet `YYYY-MM-DD`, `datetime-local` transmet `YYYY-MM-DDTHH:mm`. */
export const zDate = z.string().min(1).transform(toDate)

/**
 * Idem, avec les trois états d'une mise à jour Prisma: champ vidé = `null` (on efface),
 * champ absent = `undefined` (on ne touche à rien). Confondre les deux effacerait la date
 * sur tout formulaire partiel.
 */
export const zDateNullable = z
	.string()
	.optional()
	.transform((value) => {
		if (value === undefined) return undefined
		return value ? toDate(value) : null
	})

/** Idem, mais un champ vidé laisse aussi la valeur en place. */
export const zDateOptional = z
	.string()
	.optional()
	.transform((value) => (value ? toDate(value) : undefined))

function toDate(value: string) {
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) throw new Error(`Date invalide: ${value}`)
	return date
}

/** Un champ qui porte l'id d'une relation, là où Prisma attend `{ connect: { id } }`. */
export const zConnect = z.string().min(1).transform(idToConnect)

/** Idem, mais un champ vidé détache la relation. */
export const zConnectNullable = z
	.string()
	.optional()
	.transform((id) => (id ? idToConnect(id) : { disconnect: true as const }))

function idToConnect(id: string) {
	return { connect: { id } }
}

/** Une liste d'ids (`name="x[]"`) vers `{ connect: [...] }`, pour une création. */
export const zConnectMany = relationIds('connect')

/** Idem vers `{ set: [...] }`: la liste transmise remplace l'existant, pour une mise à jour. */
export const zSet = relationIds('set')

function relationIds<Operation extends 'connect' | 'set'>(operation: Operation) {
	return z
		.array(z.string())
		.default([])
		.transform(
			(ids) => ({ [operation]: ids.map((id) => ({ id })) }) as Record<Operation, { id: string }[]>
		)
}

/**
 * Un champ dont la valeur est un JSON sérialisé (`InputLocation`, conditions d'équipe…).
 * Une chaîne vide vaut « champ effacé », et non un JSON invalide.
 */
export function zJson<Schema extends z.ZodType>(schema: Schema) {
	return z
		.string()
		.transform((value, ctx): unknown => {
			if (!value) return undefined
			try {
				return JSON.parse(value)
			} catch {
				ctx.addIssue({ code: 'custom', message: 'JSON invalide' })
				return z.NEVER
			}
		})
		.pipe(schema)
}
