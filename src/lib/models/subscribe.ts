import z from 'zod'
import type { Prisma } from '@prisma/client'

export const modelSubscribe = z.object({
	memberId: z.string(),
	periodId: z.string(),
}) satisfies z.ZodType<Prisma.SubscribeUncheckedCreateInput>
