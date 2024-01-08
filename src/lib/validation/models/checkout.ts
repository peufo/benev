import { z, toTuple, type ZodObj } from '$lib/validation'
import { LicenceType, type Prisma } from '@prisma/client'

export const checkoutCreate = {
	name: z.string(),
	amount: z.number(),
	currency: z.enum(['CHF', 'EUR']).optional(),
	user: z.relation.connectOrCreate({
		where: z.object({ id: z.string() }),
		create: z.object({
			id: z.string(),
			firstName: z.string(),
			lastName: z.string(),
			email: z.string(),
		}),
	}),
	licences: z.relations.create({
		type: z.enum(toTuple(LicenceType)),
		quantity: z.number(),
		price: z.number(),
		checkoutId: z.string(),
		ownerId: z.string(),
	}),
} satisfies ZodObj<Prisma.CheckoutUpdateInput>

export const _checkoutCreate = {
	name: z.string(),
	amount: z.number(),
	currency: z.enum(['CHF', 'EUR']).optional(),
	userId: z.string(),
	licences: z.relations.set,
} satisfies ZodObj<Prisma.CheckoutUncheckedUpdateInput>

export const licenceCreate = {
	type: z.enum(toTuple(LicenceType)),
	quantity: z.number(),
	price: z.number(),
	checkoutId: z.string(),
	ownerId: z.string(),
} satisfies ZodObj<Prisma.LicenceUncheckedCreateInput>
