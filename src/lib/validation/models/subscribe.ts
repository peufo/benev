import { z, type ZodObj } from '$lib/validation'
import type { Prisma } from '@prisma/client'

export const subscribeCreate = {
	memberId: z.string(),
	periodId: z.string(),
} satisfies ZodObj<Prisma.SubscribeUncheckedCreateInput>
