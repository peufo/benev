import { describe, expect, it } from 'vitest'
import { canAccessEvent, isInviteHeld, isVolunteerMailHeld } from '#lib/event/eventAccess.js'

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

describe('isVolunteerMailHeld', () => {
	it("retient l'e-mail d'un évènement non publié, quel que soit le secteur", () => {
		expect(isVolunteerMailHeld('draft', 'published')).toBe(true)
		expect(isVolunteerMailHeld('archived', 'published')).toBe(true)
	})

	it("retient celle d'un secteur en brouillon, même publié", () => {
		expect(isVolunteerMailHeld('published', 'draft')).toBe(true)
	})

	it("laisse partir celle d'un secteur ouvert d'un évènement publié", () => {
		expect(isVolunteerMailHeld('published', 'published')).toBe(false)
		expect(isVolunteerMailHeld('published', 'validated')).toBe(false)
	})
})
