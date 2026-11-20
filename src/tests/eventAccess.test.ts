import { describe, expect, it } from 'vitest'
import { canAccessEvent } from '#lib/event/eventAccess.js'

const member = { roles: ['member'] }
const leader = { roles: ['leader', 'member'] }

describe('canAccessEvent', () => {
	it('ouvre un évènement publié à tous, même sans fiche', () => {
		expect(canAccessEvent({ state: 'published' }, undefined)).toBe(true)
		expect(canAccessEvent({ state: 'published' }, member)).toBe(true)
	})

	it('ferme un brouillon ou une archive aux bénévoles', () => {
		expect(canAccessEvent({ state: 'draft' }, member)).toBe(false)
		expect(canAccessEvent({ state: 'archived' }, member)).toBe(false)
		expect(canAccessEvent({ state: 'draft' }, null)).toBe(false)
	})

	it("l'ouvre aux responsables et à root", () => {
		expect(canAccessEvent({ state: 'draft' }, leader)).toBe(true)
		expect(canAccessEvent({ state: 'archived' }, leader)).toBe(true)
		expect(canAccessEvent({ state: 'draft' }, undefined, true)).toBe(true)
	})
})
