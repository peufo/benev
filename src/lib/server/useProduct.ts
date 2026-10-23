import { PRICE_STANDARD, PRICE_PREMIUM, PRICE_STANDARD_TO_PREMIUM } from '$app/env/public'
import type { EventTier } from '@prisma/client'

import { prisma } from '#lib/server/prisma.js'
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
		error(403, 'Ce produit est déjà activé pour un évènement')
	}
	if (event.ownerId !== product.checkout.userId) {
		error(403, "Le produit doit appartenir au ou à la propriétaire de l'évènement")
	}
	if (event.tier === 'premium' || event.tier === 'pro') {
		error(403, "Cet évènement a déjà l'offre premium ou pro")
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
	error(403, "Ce produit ne s'applique pas à cet évènement")

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
