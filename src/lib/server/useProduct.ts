import { PRICE_STANDARD, PRICE_PREMIUM, PRICE_STANDARD_TO_PREMIUM } from '$app/env/public'
import type { EventTier } from '@prisma/client'

import { prisma } from '$lib/server/prisma'
import { error } from '@sveltejs/kit'

export async function useProduct(eventId: string, productId: string) {
	const [event, product] = await Promise.all([
		prisma.event.findUniqueOrThrow({ where: { id: eventId } }),
		prisma.product.findUniqueOrThrow({
			where: { id: productId },
			include: { checkout: true },
		}),
	])
	if (product.eventId) {
		error(403, 'This product is already activated for an event')
	}
	if (event.ownerId !== product.checkout.userId) {
		error(403, 'The event owner and product owner must be the same person')
	}
	if (event.tier === 'premium' || event.tier === 'pro') {
		error(403, 'The event is already on tier "premium" or "pro"')
	}
	if (event.tier === 'standard' && product.priceId === PRICE_STANDARD_TO_PREMIUM) {
		return setEventTier('premium')
	}
	if (event.tier === 'basic' && product.priceId === PRICE_PREMIUM) {
		return setEventTier('premium')
	}
	if (event.tier === 'basic' && product.priceId === PRICE_STANDARD) {
		return setEventTier('standard')
	}
	error(403, 'This product cannot be activated')

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
