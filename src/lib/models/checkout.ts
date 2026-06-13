import { z, type ZodObj } from 'fuma/validation'
import type { Prisma } from '@prisma/client'

export const modelCheckout = {
	name: z.string(),
	amount: z.number(),
	currency: z.enum(['CHF', 'EUR']).optional(),
	user: z.relation.connect,
	products: z.relations.create({
		priceId: z.string(),
		quantity: z.number(),
		name: z.string(),
	}),
} satisfies ZodObj<Prisma.CheckoutCreateInput>
