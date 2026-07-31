import z from 'zod'
import { zJsonOr } from './form'

/**
 * Filtres de colonne de table.
 *
 * Leur encodage est un **contrat partagé**: les composants `TableHead*` de fuma écrivent ces
 * formes dans les paramètres d'URL, ces schémas les relisent côté serveur. Le nom du paramètre
 * est la `key` de la colonne. Changer une forme ici casse le filtrage sans rien signaler —
 * ni le typage ni les tests ne relient les deux bouts.
 */

const order = z.enum(['asc', 'desc']).optional()

/** `{ min, max, order }` — écrit par `TableHeadNumber`. */
export const filterNumber = zJsonOr(
	z.object({ min: z.number().optional(), max: z.number().optional(), order })
).optional()

/** `{ start, end, order }` — écrit par `TableHeadDate`. */
export const filterRange = zJsonOr(
	z.object({ start: z.coerce.date().optional(), end: z.coerce.date().optional(), order })
).optional()

/** Un tableau de valeurs — écrit par `TableHeadSelect` en mode `multiSelect`. */
export const filterMultiselect = zJsonOr(z.array(z.string())).optional()

/** Valeur brute et non JSON: `TableHeadBoolean` délègue à un select simple. */
export const filterBoolean = z
	.enum(['true', 'false'])
	.transform((value) => value === 'true')
	.optional()
