import type { Prisma } from '@prisma/client'
import { z, type ZodObj } from 'fuma'

const zodConnectNullish = z
	.object({ id: z.string() })
	.nullish()
	.transform((item) => (item ? { connect: item } : { disconnect: true }))

export const modelBadgeUpdate = {
	name: z.string().min(2),
	width: z.number().min(20),
	height: z.number().min(20),
	accessCellSize: z.number().min(3),
	versoEnabled: z.boolean(),
	backgroundId: z.string().nullish(),
	logoId: z.string().nullish(),
	typeField: zodConnectNullish,
	accessDaysField: zodConnectNullish,
	accessSectorsField: zodConnectNullish,
	labelField: zodConnectNullish,
	colorMap: z.record(z.string(), z.string()),
	colorDefault: z.string(),
} satisfies ZodObj<
	Prisma.BadgeUpdateInput & Pick<Prisma.BadgeUncheckedUpdateInput, 'backgroundId' | 'logoId'>
>
