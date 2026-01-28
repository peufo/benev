import type { Prisma } from '@prisma/client'
import { z, type ZodObj } from 'fuma'

export const modelBadgeUpdate = {
	name: z.string().min(2),
	background: z.relation.connect,
	logo: z.relation.connect,
	typeField: z.relation.connect,
	accessDaysField: z.relation.connect,
	accessSectorsField: z.relation.connect,
	colorMap: z.record(z.string()),
	colorDefault: z.string(),
} satisfies ZodObj<Prisma.BadgeUpdateInput>
