import z from 'zod'
import { zConnectNullable, zJson, zNumber } from './form'
import type { Prisma } from '@prisma/client'

/**
 * `BadgeForm` sauvegarde en continu et pilote l'aperçu: ses champs restent des `<input>` bruts
 * liés par `bind:value`, d'où les conversions depuis la chaîne.
 */
export const modelBadgeUpdate = z.object({
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
}) satisfies z.ZodType<Prisma.BadgeUpdateInput>
