import { it } from 'vitest'
import { formatRangeHour, formatRangeHourSpan } from '#lib/formatRange.js'
import { describeInSystemZones } from './systemZones'

const ZONE = 'Europe/Zurich'

describeInSystemZones('formatRangeHour', () => {
	it("rend une seule heure pour des bornes égales, la nuit du passage à l'heure d'hiver", ({
		expect,
	}) => {
		for (const iso of ['2026-10-24T23:30:00Z', '2026-10-25T00:30:00Z', '2026-10-25T01:30:00Z']) {
			const date = new Date(iso)
			expect(formatRangeHour({ start: date, end: date }, ZONE)).toMatch(/^\d{2}:\d{2}$/)
		}
	})

	it('rend les deux bornes sinon', ({ expect }) => {
		const range = { start: new Date('2026-10-24T22:00:00Z'), end: new Date('2026-10-25T03:00:00Z') }
		expect(formatRangeHour(range, ZONE)).toBe('00:00 – 04:00')
	})
})

describeInSystemZones('formatRangeHourSpan', () => {
	it("garde l'heure seule pour un créneau d'un jour, la nuit du passage à l'heure d'hiver", ({
		expect,
	}) => {
		const range = { start: new Date('2026-10-24T22:00:00Z'), end: new Date('2026-10-25T03:00:00Z') }
		expect(formatRangeHourSpan(range, ZONE)).toBe('00:00 – 04:00')
	})

	it('dit les jours d’un créneau qui passe minuit', ({ expect }) => {
		const range = { start: new Date('2026-10-24T20:00:00Z'), end: new Date('2026-10-25T03:00:00Z') }
		expect(formatRangeHourSpan(range, ZONE)).toMatch(/^\S+ 24\.10 22:00 – \S+ 25\.10 04:00$/)
	})
})
