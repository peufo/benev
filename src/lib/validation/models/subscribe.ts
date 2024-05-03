import { z, type ZodObj } from 'fuma'
import type { Prisma } from '@prisma/client'

export const modelSubscribe = {
	memberId: z.string(),
	periodId: z.string(),
} satisfies ZodObj<Prisma.SubscribeUncheckedCreateInput>
