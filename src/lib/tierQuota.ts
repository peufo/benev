import type { EventTier } from '@prisma/client'
import { EVENT_TIER } from '$lib/constant'

export function computeIsTierQuotaReached(membersValided: number, tier: EventTier): boolean {
	const max = EVENT_TIER[tier].max
	if (max === null) return false
	return membersValided >= max
}
