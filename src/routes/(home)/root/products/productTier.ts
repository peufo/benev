import { EVENT_TIER } from '$lib/constant'
import type { EventTier } from '@prisma/client'

/** Ce qu'un produit active, relu dans les prix de `EVENT_TIER`: un prix inconnu reste affiché brut. */
export function productTierLabel(priceId: string): string {
	for (const { label, priceId: id, upgradePriceId } of Object.values(EVENT_TIER)) {
		if (id === priceId) return label
		for (const [from, upgradeId] of Object.entries(upgradePriceId ?? {})) {
			if (upgradeId === priceId) return `${EVENT_TIER[from as EventTier].label} → ${label}`
		}
	}
	return priceId
}
