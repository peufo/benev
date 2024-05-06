import { z, toTuple, type ZodObj } from 'fuma/validation'
import type { Prisma } from '@prisma/client'
import { LICENCE_TYPE_LABEL } from '$lib/constant'

export const modelCheckout = {
	name: z.string(),
	amount: z.number(),
	currency: z.enum(['CHF', 'EUR']).optional(),
	user: z.relation.connect,
	licences: z.relations.create({
		type: z.enum(toTuple(LICENCE_TYPE_LABEL)),
		quantity: z.number(),
		ownerId: z.string(),
	}),
} satisfies ZodObj<Prisma.CheckoutCreateInput>
