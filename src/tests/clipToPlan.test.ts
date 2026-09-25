import { describe, it } from 'vitest'
import dayjs from '$lib/dayjs'
import { clipToPlan } from '$lib/plan/clipToPlan'

const plan = { start: dayjs(new Date(2026, 8, 1)), end: dayjs(new Date(2026, 8, 15)) }
const day = (d: number, hour = 0) => new Date(2026, 8, d, hour).getTime()

describe('clipToPlan', () => {
	it('leaves a period inside the plan untouched', ({ expect }) => {
		expect(clipToPlan({ start: day(3, 8), end: day(3, 12) }, plan)).toEqual({
			start: day(3, 8),
			end: day(3, 12),
			clippedStart: false,
			clippedEnd: false,
		})
	})

	it('clips a period that starts before the plan', ({ expect }) => {
		expect(clipToPlan({ start: day(1) - 3_600_000, end: day(1, 6) }, plan)).toEqual({
			start: day(1),
			end: day(1, 6),
			clippedStart: true,
			clippedEnd: false,
		})
	})

	it('clips a period that ends after the plan', ({ expect }) => {
		expect(clipToPlan({ start: day(14, 22), end: day(16, 6) }, plan)).toEqual({
			start: day(14, 22),
			end: day(15),
			clippedStart: false,
			clippedEnd: true,
		})
	})

	it('clips both ends of a period longer than the plan', ({ expect }) => {
		expect(clipToPlan({ start: day(1) - 86_400_000, end: day(20) }, plan)).toEqual({
			start: day(1),
			end: day(15),
			clippedStart: true,
			clippedEnd: true,
		})
	})

	// Glissée hors de la plage, la carte se colle au bord plutôt que de prendre une taille négative.
	it('never returns an end before the start', ({ expect }) => {
		const clipped = clipToPlan({ start: day(16), end: day(17) }, plan)
		expect(clipped.end).toBeGreaterThanOrEqual(clipped.start)
	})
})
