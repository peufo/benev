import { error } from '@sveltejs/kit'
import { form, getRequestEvent, query } from '$app/server'
import z from 'zod'
import { prisma, useProduct } from '$lib/server'

/** Alimente l'`InputRelation` de `ProductUseForm`, en lieu et place de `/me/events/search`. */
export const searchOwnedEvents = query(z.object({ search: z.string() }), async ({ search }) => {
	const { locals } = getRequestEvent()
	const session = await locals.auth.validate()
	if (!session) error(401)

	return prisma.event.findMany({
		where: { ownerId: session.user.userId, deletedAt: null, name: { contains: search } },
		orderBy: { createdAt: 'desc' },
		take: 10,
		select: { id: true, name: true, tier: true },
	})
})

export const useProductOnEvent = form(
	z.object({ productId: z.string(), eventId: z.string().min(1) }),
	async ({ productId, eventId }) => {
		const { locals } = getRequestEvent()
		const session = await locals.auth.validate()
		if (!session) error(401)

		const product = await prisma.product.findUnique({
			where: { id: productId },
			include: { checkout: true },
		})
		if (!product || product.checkout.userId !== session.user.userId) error(403)

		await useProduct(eventId, productId)
		return { success: true }
	}
)
