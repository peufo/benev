import type { Prisma } from '@prisma/client'
import z from 'zod'
import { zConnect } from './form'

export const modelCheckout = z.object({
	name: z.string(),
	amount: z.number(),
	currency: z.enum(['CHF', 'EUR']).optional(),
	// `InputSelect` de fuma 2 transmet l'id du propriétaire, pas l'objet `{ id }`.
	user: zConnect,
	products: z
		.array(
			z.object({
				priceId: z.string(),
				quantity: z.number(),
				name: z.string(),
			})
		)
		.default([])
		.transform((create) => ({ create })),
}) satisfies z.ZodType<Prisma.CheckoutCreateInput>
