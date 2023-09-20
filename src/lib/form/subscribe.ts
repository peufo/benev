import z from 'zod'
import type { Prisma, Subscribe } from '@prisma/client'
import { type ZodObj } from './utils'

export const subscribeStateLabel: Record<Subscribe['state'], string> = {
	request: 'Demande en cours',
	accepted: 'Validé',
	denied: 'Refusé',
	cancelled: 'Annuler',
}

const subscribeForm = {
	memberId: z.string(),
	periodId: z.string(),
	// state: z.enum(toTuple(subscribeStateLabel)).optional(),
} satisfies ZodObj<Prisma.SubscribeUncheckedCreateInput>

export const subscribeShema = z.object(subscribeForm)
