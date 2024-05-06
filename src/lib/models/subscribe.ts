import { z, type ZodObj } from 'fuma/validation'
import type { Prisma } from '@prisma/client'

export const modelSubscribe = {
	memberId: z.string(),
	periodId: z.string(),
} satisfies ZodObj<Prisma.SubscribeUncheckedCreateInput>
