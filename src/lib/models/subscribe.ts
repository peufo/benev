import { z, type ZodObj } from '$lib/fuma-legacy/validation'
import type { Prisma } from '@prisma/client'

export const modelSubscribe = {
	memberId: z.string(),
	periodId: z.string(),
} satisfies ZodObj<Prisma.SubscribeUncheckedCreateInput>
