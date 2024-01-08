import { z, toTuple, type ZodObj } from '$lib/validation'
import { LicenceType, type Prisma } from '@prisma/client'

export const checkoutCreate = {
	name: z.string(),
	amount: z.number(),
	currency: z.enum(['CHF', 'EUR']).optional(),
	user: z.relation.connect,
	licences: z.relations.create({
		type: z.enum(toTuple(LicenceType)),
		quantity: z.number(),
		price: z.number(),
		checkoutId: z.string(),
		ownerId: z.string(),
	}),
} satisfies ZodObj<Prisma.CheckoutCreateInput>
