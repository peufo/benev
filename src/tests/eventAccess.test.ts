import { describe, expect, it } from 'vitest'
import { canAccessEvent, isInviteHeld, isRequestHeld } from '#lib/event/eventAccess.js'

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

describe('isInviteHeld', () => {
	it("retient l'invitation d'un membre sans rôle tant que l'évènement n'est pas publié", () => {
		expect(isInviteHeld('draft', { hasRole: false })).toBe(true)
		expect(isInviteHeld('archived', { hasRole: false })).toBe(true)
		expect(isInviteHeld('published', { hasRole: false })).toBe(false)
	})

	it("laisse partir celle d'un rôle, qui ouvre déjà l'espace", () => {
		expect(isInviteHeld('draft', { hasRole: true })).toBe(false)
		expect(isInviteHeld('archived', { hasRole: true })).toBe(false)
	})
})

describe('isRequestHeld', () => {
	it("retient la demande d'un évènement non publié, quel que soit le secteur", () => {
		expect(isRequestHeld('draft', 'published')).toBe(true)
		expect(isRequestHeld('archived', 'published')).toBe(true)
	})

	it("retient celle d'un secteur en brouillon, même publié", () => {
		expect(isRequestHeld('published', 'draft')).toBe(true)
	})

	it("laisse partir celle d'un secteur ouvert d'un évènement publié", () => {
		expect(isRequestHeld('published', 'published')).toBe(false)
		expect(isRequestHeld('published', 'validated')).toBe(false)
	})
})
