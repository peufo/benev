import { error } from '@sveltejs/kit'
import { formAction } from 'fuma/server'
import { z } from 'fuma/validation'

import { getUserOrRedirect, prisma, useProduct } from '$lib/server'

export const load = async ({ url, locals }) => {
	const user = await getUserOrRedirect(url, locals)

	const checkouts = await prisma.checkout.findMany({
		where: { userId: user.id },
		include: {
			products: {
				include: { event: { select: { id: true, name: true, deletedAt: true } } },
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	})

	return { checkouts }
}

export const actions = {
	use_product: formAction(
		{
			productId: z.string(),
			event: z.object({ id: z.string() }),
		},
		async ({ locals, data }) => {
			const session = await locals.auth.validate()
			if (!session) error(401)

			const product = await prisma.product.findUnique({
				where: { id: data.productId },
				include: { checkout: true },
			})
			if (!product || product.checkout.userId !== session.user.userId) error(403)

			await useProduct(data.event.id, data.productId)
			return { success: true }
		}
	),
}
