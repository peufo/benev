import { describe, expect, it } from 'vitest'
import {
	canAccessEvent,
	isInviteHeld,
	isMemberMailHeld,
	isSubscribeAnnounced,
} from '#lib/event/eventAccess.js'

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

describe('isMemberMailHeld', () => {
	const role = { hasRole: true }
	const noRole = { hasRole: false }

	it("retient celui d'un membre sans rôle tant que l'évènement n'est pas publié", () => {
		expect(isMemberMailHeld('draft', 'published', noRole)).toBe(true)
		expect(isMemberMailHeld('archived', 'published', noRole)).toBe(true)
		expect(isMemberMailHeld('published', 'published', noRole)).toBe(false)
	})

	it("laisse partir celui d'un rôle, qui entre dans l'évènement fermé", () => {
		expect(isMemberMailHeld('draft', 'published', role)).toBe(false)
		expect(isMemberMailHeld('archived', 'validated', role)).toBe(false)
	})

	it('retient tout ce qui touche un secteur en brouillon', () => {
		expect(isMemberMailHeld('published', 'draft', role)).toBe(true)
		expect(isMemberMailHeld('draft', 'draft', role)).toBe(true)
		expect(isMemberMailHeld('draft', 'draft', { hasRole: true, announced: true })).toBe(true)
	})

	it('laisse partir ce qui touche une inscription déjà connue, même évènement fermé', () => {
		const announced = { hasRole: false, announced: true }
		expect(isMemberMailHeld('draft', 'published', announced)).toBe(false)
		expect(isMemberMailHeld('archived', 'validated', announced)).toBe(false)
	})
})

describe('isSubscribeAnnounced', () => {
	it('connaît une inscription créée par le membre lui-même', () => {
		expect(isSubscribeAnnounced({ createdBy: 'user', notifiedAt: null })).toBe(true)
	})

	it("ne connaît la proposition d'un·e responsable qu'une fois envoyée", () => {
		expect(isSubscribeAnnounced({ createdBy: 'leader', notifiedAt: null })).toBe(false)
		expect(isSubscribeAnnounced({ createdBy: 'leader', notifiedAt: new Date() })).toBe(true)
	})
})
