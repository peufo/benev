import { tryOrFail, parseFormData } from 'fuma/server'
import { permission, prisma } from '$lib/server'
import { modelCheckout } from '$lib/models'
import type { Prisma } from '@prisma/client'

export const actions = {
	default: async ({ locals, request }) => {
		await permission.root(locals)

		return tryOrFail(async () => {
			const { data } = await parseFormData(request, modelCheckout)

			const productsArray = Array.isArray(data.products.create)
				? data.products.create
				: [data.products.create]
			const products = productsArray
				.filter(({ quantity }) => quantity > 0)
				.map(({ priceId, name, quantity }) =>
					Array<Prisma.ProductUncheckedCreateWithoutCheckoutInput>(quantity).fill({
						priceId,
						name,
					})
				)
				.flat()

			if (products.length === 0) throw new Error('Aucun produit sélectionné')

			return prisma.checkout.create({
				data: { ...data, products: { create: products } },
			})
		}, '/root/checkouts')
	},
}
