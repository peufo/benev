import { describe, it } from 'vitest'
import type { Page, PageType, Period, Team } from '@prisma/client'
import { clonePages, cloneTeam } from '$lib/server/clone'

const day = 1000 * 60 * 60 * 24
const createdAt = new Date('2026-06-01T08:00:00Z')

const team: Team & { periods: Period[] } = {
	id: 'team',
	name: 'Bar',
	description: null,
	state: 'published',
	closeSubscribing: null,
	overflowPermitted: false,
	conditions: null,
	position: 0,
	eventId: 'fete',
	createdAt,
	updatedAt: createdAt,
	periods: [
		{
			id: 'period',
			teamId: 'team',
			maxSubscribe: 4,
			start: new Date('2026-07-01T18:00:00Z'),
			end: new Date('2026-07-01T22:00:00Z'),
			createdAt,
			updatedAt: createdAt,
		},
	],
}

function aPage(type: PageType, path: string): Page {
	return {
		id: path,
		eventId: 'fete',
		title: path,
		path,
		position: 0,
		type,
		state: 'published',
		content: 'null',
		description: null,
		createdAt,
		updatedAt: createdAt,
	}
}

describe('cloneTeam', () => {
	it('repart en brouillon, créneaux décalés', ({ expect }) => {
		const clone = cloneTeam(team, 7 * day)
		expect(clone.state).toBe('draft')
		expect(clone.periods?.create).toEqual([
			{
				maxSubscribe: 4,
				start: new Date('2026-07-08T18:00:00Z'),
				end: new Date('2026-07-08T22:00:00Z'),
			},
		])
	})
})

describe('clonePages', () => {
	it("passe en brouillon tout ce qui en a un, jamais l'accueil ni les courriels", ({ expect }) => {
		const pages = clonePages([
			aPage('home', 'bienvenue'),
			aPage('public', 'infos'),
			aPage('member', 'coulisses'),
			aPage('charter', 'charte'),
			aPage('email', 'subscribe_accepted'),
		])
		const stateOf = (path: string) => pages.find((p) => p.path === path)?.state
		expect(stateOf('bienvenue')).toBe('published')
		expect(stateOf('subscribe_accepted')).toBe('published')
		expect(stateOf('infos')).toBe('draft')
		expect(stateOf('coulisses')).toBe('draft')
		expect(stateOf('charte')).toBe('draft')
	})
})
