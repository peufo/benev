import { describe, it } from 'vitest'
import { computeIsTierQuotaReached } from '$lib/tierQuota'

describe('computeIsTierQuotaReached', () => {
	it('returns false for unlimited tiers', ({ expect }) => {
		expect(computeIsTierQuotaReached(999_999, 'premium')).toBe(false)
		expect(computeIsTierQuotaReached(999_999, 'pro')).toBe(false)
	})

	it('returns false when under quota', ({ expect }) => {
		expect(computeIsTierQuotaReached(0, 'basic')).toBe(false)
		expect(computeIsTierQuotaReached(49, 'basic')).toBe(false)
		expect(computeIsTierQuotaReached(199, 'standard')).toBe(false)
	})

	// les formules annoncent « Jusqu'à {max} bénévoles »: être pile à max reste permis
	it('returns false at exactly the quota', ({ expect }) => {
		expect(computeIsTierQuotaReached(50, 'basic')).toBe(false)
		expect(computeIsTierQuotaReached(200, 'standard')).toBe(false)
	})

	it('returns true when quota is exceeded', ({ expect }) => {
		expect(computeIsTierQuotaReached(51, 'basic')).toBe(true)
		expect(computeIsTierQuotaReached(201, 'standard')).toBe(true)
	})
})
