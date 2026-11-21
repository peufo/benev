import { describe, expect, it } from 'vitest'
import { createRateLimit } from '#lib/server/rateLimit.js'

describe('createRateLimit', () => {
	it('refuse au-delà du maximum, par clé', () => {
		const isLimited = createRateLimit({ windowMs: 60_000, max: 2 })
		expect(isLimited('a')).toBe(false)
		expect(isLimited('a')).toBe(false)
		expect(isLimited('a')).toBe(true)
		expect(isLimited('b')).toBe(false)
	})

	it("rend la place d'un geste qui n'a pas eu lieu", () => {
		const isLimited = createRateLimit({ windowMs: 60_000, max: 2 })
		expect(isLimited('a')).toBe(false)
		expect(isLimited('a')).toBe(false)
		isLimited.refund('a')
		expect(isLimited('a')).toBe(false)
		expect(isLimited('a')).toBe(true)
	})

	it("ne rend rien à une clé qui n'a rien consommé", () => {
		const isLimited = createRateLimit({ windowMs: 60_000, max: 1 })
		isLimited.refund('a')
		expect(isLimited('a')).toBe(false)
		expect(isLimited('a')).toBe(true)
	})
})
