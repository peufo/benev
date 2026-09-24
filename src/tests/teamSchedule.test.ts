import { describe, it } from 'vitest'
import { effectiveClose, nextClose, planTransitions } from '$lib/team/teamSchedule'

const since = new Date('2026-09-19T10:00:00Z')
const until = new Date('2026-09-19T10:01:00Z')
const inside = new Date('2026-09-19T10:00:30Z')
const none = { closeSubscribing: null }

describe('effectiveClose', () => {
	it("reprend la date de l'évènement à défaut de celle du secteur", ({ expect }) => {
		const close = new Date('2026-10-02T08:00:00Z')
		expect(effectiveClose(none, { closeSubscribing: close })).toEqual(close)
		expect(effectiveClose({ closeSubscribing: close }, { closeSubscribing: inside })).toEqual(close)
	})

	it('relit une date passée par JSON', ({ expect }) => {
		expect(effectiveClose({ closeSubscribing: '2026-10-01T08:00:00Z' }, none)).toEqual(
			new Date('2026-10-01T08:00:00Z')
		)
	})
})

describe('planTransitions', () => {
	it("ferme un secteur publié à l'instant dû, par la date de l'évènement aussi", ({ expect }) => {
		const transitions = planTransitions(
			[
				{ id: 'a', state: 'published', closeSubscribing: inside, event: none },
				{ id: 'b', state: 'published', ...none, event: { closeSubscribing: inside } },
			],
			{ since, until }
		)
		expect(transitions).toEqual([
			{ teamId: 'a', at: inside, from: 'published', to: 'validated' },
			{ teamId: 'b', at: inside, from: 'published', to: 'validated' },
		])
	})

	it('laisse un brouillon et un secteur validé tranquilles', ({ expect }) => {
		const transitions = planTransitions(
			[
				{ id: 'a', state: 'draft', closeSubscribing: inside, event: none },
				{ id: 'b', state: 'validated', closeSubscribing: inside, event: none },
			],
			{ since, until }
		)
		expect(transitions).toEqual([])
	})

	it('exclut la borne basse et inclut la borne haute', ({ expect }) => {
		const transitions = planTransitions(
			[
				{ id: 'low', state: 'published', closeSubscribing: since, event: none },
				{ id: 'high', state: 'published', closeSubscribing: until, event: none },
			],
			{ since, until }
		)
		expect(transitions.map((t) => t.teamId)).toEqual(['high'])
	})
})

describe('nextClose', () => {
	const now = since.getTime()
	const future = new Date('2026-10-01T08:00:00Z')
	const past = new Date('2026-09-01T08:00:00Z')
	const event = { ...none, selfSubscribeAllowed: true }

	it("annonce la fermeture à venir d'un secteur publié", ({ expect }) => {
		expect(nextClose({ state: 'published', closeSubscribing: future }, event, now)).toEqual(future)
	})

	it("tait une date passée, un secteur non publié, et l'inscription libre coupée", ({ expect }) => {
		expect(nextClose({ state: 'published', closeSubscribing: past }, event, now)).toBeNull()
		expect(nextClose({ state: 'validated', closeSubscribing: future }, event, now)).toBeNull()
		expect(
			nextClose(
				{ state: 'published', closeSubscribing: future },
				{ ...event, selfSubscribeAllowed: false },
				now
			)
		).toBeNull()
	})
})
