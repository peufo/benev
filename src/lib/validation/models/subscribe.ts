import { z, type ZodObj } from '$lib/validation'
import type { Prisma, Subscribe } from '@prisma/client'

export const subscribeStateLabel: Record<Subscribe['state'], string> = {
	request: 'Demande en cours',
	accepted: 'Validé',
	denied: 'Décliné',
	cancelled: 'Annulé',
}

export const subscribeCreate = {
	memberId: z.string(),
	periodId: z.string(),
	// state: z.enum(toTuple(subscribeStateLabel)).optional(),
} satisfies ZodObj<Prisma.SubscribeUncheckedCreateInput>