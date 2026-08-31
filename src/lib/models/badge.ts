import z from 'zod'
import { zConnectNullable, zJson } from './form'
import type { Prisma } from '@prisma/client'

/**
 * Les dimensions passent par l'`InputNumber` de fuma, donc par `field.as('number')`, qui
 * préfixe le `name` de `n:` et fait convertir SvelteKit lui-même: `z.number()` suffit. Les
 * quatre relations passent par le `field` d'`InputFieldSelect`: rien de choisi vaut clé
 * absente, donc `undefined`, que `zConnectNullable` traduit en `disconnect`.
 */
export const modelBadgeUpdate = z.object({
	name: z.string().min(2),
	width: z.number().min(20),
	height: z.number().min(20),
	accessCellSize: z.number().min(3),
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
