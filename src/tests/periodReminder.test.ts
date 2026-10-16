import { describe, it } from 'vitest'
import { planReminders, reminderAt } from '#lib/period/periodReminder.js'

const HOUR = 60 * 60_000
const since = new Date('2026-10-16T10:00:00Z')
const until = new Date('2026-10-16T10:01:00Z')

/** Un créneau qui commence `hours` heures après l'instant donné. */
function startAfter(at: Date, hours: number) {
	return new Date(at.getTime() + hours * HOUR)
}

describe('reminderAt', () => {
	it('recule du délai, et relit une date passée par JSON', ({ expect }) => {
		expect(reminderAt('2026-10-17T10:00:00Z', 24)).toEqual(new Date('2026-10-16T10:00:00Z'))
	})

	it('ne rappelle rien quand le délai est nul', ({ expect }) => {
		expect(reminderAt(new Date(), 0)).toBeNull()
	})
})

describe('planReminders', () => {
	it('suit le délai de chaque évènement dans la même fenêtre', ({ expect }) => {
		const inside = new Date('2026-10-16T10:00:30Z')
		const periods = [
			{ id: 'veille', start: startAfter(inside, 24), event: { reminderHours: 24 } },
			{ id: 'deux-heures', start: startAfter(since, 2.005), event: { reminderHours: 2 } },
			{ id: 'trop-tot', start: startAfter(inside, 24), event: { reminderHours: 2 } },
		]
		expect(planReminders(periods, { since, until }).map(({ id }) => id)).toEqual([
			'deux-heures',
			'veille',
		])
	})

	it('exclut la borne basse et inclut la borne haute', ({ expect }) => {
		const periods = [
			{ id: 'since', start: startAfter(since, 24), event: { reminderHours: 24 } },
			{ id: 'until', start: startAfter(until, 24), event: { reminderHours: 24 } },
		]
		expect(planReminders(periods, { since, until }).map(({ id }) => id)).toEqual(['until'])
	})

	it("ne rappelle rien pour un évènement qui l'a coupé", ({ expect }) => {
		const periods = [{ start: startAfter(until, 0), event: { reminderHours: 0 } }]
		expect(planReminders(periods, { since, until })).toEqual([])
	})
})
