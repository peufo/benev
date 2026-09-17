import { describe, it } from 'vitest'
import { engagedSubscribes, scheduleChanged } from '$lib/period/periodChange'

describe('engagedSubscribes', () => {
	it("ne garde que ce qui attend une réponse ou l'a reçue", ({ expect }) => {
		const subscribes = [
			{ id: 'a', state: 'accepted' as const },
			{ id: 'r', state: 'request' as const },
			{ id: 'd', state: 'denied' as const },
			{ id: 'c', state: 'cancelled' as const },
		]
		expect(engagedSubscribes(subscribes).map(({ id }) => id)).toEqual(['a', 'r'])
	})
})

describe('scheduleChanged', () => {
	const start = new Date('2026-07-04T08:00:00Z')
	const end = new Date('2026-07-04T12:00:00Z')

	it('ne voit rien quand les bornes sont les mêmes', ({ expect }) => {
		expect(scheduleChanged({ start, end }, { start: new Date(start), end: new Date(end) })).toBe(
			false
		)
	})

	it("compte une minute comme un changement: il n'y a pas de tolérance", ({ expect }) => {
		const shifted = new Date(start.getTime() + 60 * 1000)
		expect(scheduleChanged({ start, end }, { start: shifted, end })).toBe(true)
		expect(scheduleChanged({ start, end }, { start, end: shifted })).toBe(true)
	})

	it('accepte les chaînes ISO, telles que le JSON les rend', ({ expect }) => {
		expect(
			scheduleChanged({ start: start.toISOString(), end: end.toISOString() }, { start, end })
		).toBe(false)
	})
})
