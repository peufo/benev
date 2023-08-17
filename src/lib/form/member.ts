import z from 'zod'
import type { Prisma } from '@prisma/client'
import type { ZodObj } from './utils'

const memberForm = {
	userId: z.string(),
} satisfies ZodObj<Omit<Prisma.MemberUncheckedCreateInput, 'eventId'>>

export const memberShema = z.object(memberForm)
