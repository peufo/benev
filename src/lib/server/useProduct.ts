import { env } from '$env/dynamic/public'
import type { EventTier } from '@prisma/client'

import { prisma } from '$lib/server/prisma'

export async function useProduct(eventId: string, productId: string) {
	const [event, product] = await Promise.all([
		prisma.event.findUniqueOrThrow({ where: { id: eventId } }),
		prisma.product.findUniqueOrThrow({
			where: { id: productId },
			include: { checkout: true },
		}),
	])
	if (product.eventId) {
		throw new Error('This product is already activated for an event')
	}
	if (event.ownerId !== product.checkout.userId) {
		throw new Error('The event owner and product owner must be the same person')
	}
	if (event.tier === 'premium' || event.tier === 'pro') {
		throw new Error('The event is already on tier "premium" or "pro"')
	}
	if (event.tier === 'standard' && product.priceId === env.PUBLIC_PRICE_STANDARD_TO_PREMIUM) {
		return setEventTier('premium')
	}
	if (event.tier === 'basic' && product.priceId === env.PUBLIC_PRICE_PREMIUM) {
		return setEventTier('premium')
	}
	if (event.tier === 'basic' && product.priceId === env.PUBLIC_PRICE_STANDARD) {
		return setEventTier('standard')
	}
	throw new Error('This product cannot be activated')

	async function setEventTier(tier: EventTier) {
		return prisma.$transaction([
			prisma.event.update({
				where: { id: event.id },
				data: {
					tier,
					notifiedQuota80: null,
					notifiedQuota90: null,
					notifiedQuota100: null,
				},
			}),
			prisma.product.update({ where: { id: product.id }, data: { eventId: event.id } }),
		])
	}
}
