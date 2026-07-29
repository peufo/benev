import type { Prisma } from '@prisma/client'
import { form, getRequestEvent, query } from '$app/server'
import { redirect } from '@sveltejs/kit'
import z from 'zod'
import { modelCheckout } from '$lib/models'
import { permission, prisma } from '$lib/server'

export const searchUsers = query(z.object({ search: z.string() }), async ({ search }) => {
	const { locals } = getRequestEvent()
	await permission.root(locals)

	return prisma.user.findMany({
		where: {
			OR: [
				{ firstName: { contains: search } },
				{ lastName: { contains: search } },
				{ email: { contains: search } },
			],
		},
		take: 10,
		select: { id: true, firstName: true, lastName: true, email: true },
	})
})

export const createCheckout = form(z.object(modelCheckout), async (data) => {
	const { locals } = getRequestEvent()
	await permission.root(locals)

	// Une quantité de 2 vaut deux exemplaires du produit, d'où le dépliage.
	const products = data.products.create
		.filter(({ quantity }) => quantity > 0)
		.flatMap(({ priceId, name, quantity }) =>
			Array<Prisma.ProductUncheckedCreateWithoutCheckoutInput>(quantity).fill({ priceId, name })
		)

	if (products.length === 0) throw new Error('Aucun produit sélectionné')

	await prisma.checkout.create({ data: { ...data, products: { create: products } } })
	redirect(303, '/root/checkouts')
})
