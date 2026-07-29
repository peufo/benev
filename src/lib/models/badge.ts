import z from 'zod'
import { zConnectNullable, zJson, zNumber } from './form'

/**
 * `BadgeForm` sauvegarde en continu et pilote l'aperçu: ses champs restent des `<input>` bruts
 * liés par `bind:value`, d'où les conversions depuis la chaîne. Le `satisfies` d'origine
 * (`ZodObj<Prisma.BadgeUpdateInput>`) tombe avec `zConnectNullable`, dont la sortie ne décrit
 * qu'une des variantes acceptées par Prisma: c'est l'appel `prisma.badge.update` qui vérifie.
 */
export const modelBadgeUpdate = {
	name: z.string().min(2),
	width: zNumber(20),
	height: zNumber(20),
	accessCellSize: zNumber(3),
	versoEnabled: z.boolean().default(false),
	backgroundId: z.string().optional(),
	logoId: z.string().optional(),
	typeField: zConnectNullable,
	accessDaysField: zConnectNullable,
	accessSectorsField: zConnectNullable,
	labelField: zConnectNullable,
	colorMap: zJson(z.record(z.string(), z.string())),
	colorDefault: z.string(),
}
