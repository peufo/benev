import { z, toTuple, type ZodObj } from '$lib/validation'
import type { Prisma } from '@prisma/client'
import { LICENCE_TYPE } from '$lib/constant'

export const checkoutCreate = {
	name: z.string(),
	amount: z.number(),
	currency: z.enum(['CHF', 'EUR']).optional(),
	user: z.relation.connect,
	licences: z.relations.create({
		type: z.enum(toTuple(LICENCE_TYPE)),
		quantity: z.number(),
		price: z.number(),
		ownerId: z.string(),
	}),
} satisfies ZodObj<Prisma.CheckoutCreateInput>
