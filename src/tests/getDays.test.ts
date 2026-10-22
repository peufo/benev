import { describe, it } from 'vitest'
import dayjs from '#lib/dayjs.js'
import { getDays, getHourTicks } from '#lib/plan/getDays.js'
import { time } from '#lib/plan/utils.js'

const ZONE = 'Europe/Zurich'

/** La plage telle que `getPlan` la construit: du minuit du premier jour à la fin du dernier. */
function range(first: string, last: string, zone = ZONE) {
	const start = dayjs.tz(first, zone).startOf('day')
	const end = dayjs.tz(last, zone).endOf('day')
	return { start, end, days: getDays(start, end, zone) }
}

const HOURS = Array.from({ length: 24 }, (_, h) => h)

describe('getDays', () => {
	it("compte 25 heures le jour du passage à l'heure d'hiver", ({ expect }) => {
		const { days } = range('2026-10-22', '2026-10-28')
		expect(days.map(({ hours }) => hours.length)).toEqual([24, 24, 24, 25, 24, 24, 24])
		expect(days[3].hours).toEqual([0, 1, 2, ...HOURS.slice(2)])
	})

	it("compte 23 heures le jour du passage à l'heure d'été", ({ expect }) => {
		const { days } = range('2026-03-26', '2026-04-01')
		expect(days.map(({ hours }) => hours.length)).toEqual([24, 24, 24, 23, 24, 24, 24])
		expect(days[3].hours).toEqual([0, 1, ...HOURS.slice(3)])
	})

	it('fait commencer chaque jour à son vrai minuit local', ({ expect }) => {
		const { days } = range('2026-10-22', '2026-10-28')
		for (const { date } of days) {
			const local = dayjs(date.valueOf()).tz(ZONE)
			expect(local.format('HH:mm')).toBe('00:00')
		}
		expect(days[4].date.toISOString()).toBe('2026-10-25T23:00:00.000Z')
	})

	// Cartes, jalons et ghost se placent en temps écoulé depuis le début du plan: l'échelle doit
	// compter exactement autant d'heures, sans quoi tout ce qui suit une bascule glisse d'une heure.
	it("compte autant de cases que d'heures écoulées", ({ expect }) => {
		for (const [first, last] of [
			['2026-10-15', '2026-10-29'],
			['2026-03-22', '2026-04-05'],
		]) {
			const { start, end, days } = range(first, last)
			const cells = days.reduce((acc, { hours }) => acc + hours.length, 0)
			expect(cells).toBe(Math.ceil(time(end.diff(start)).to('hour')))
		}
	})

	it("garde 24 heures par jour dans un fuseau sans heure d'été", ({ expect }) => {
		const { days } = range('2026-10-22', '2026-10-28', 'UTC')
		for (const { hours } of days) expect(hours).toEqual(HOURS)
	})

	it('gradue le jour de 25 heures sans libeller la case tronquée', ({ expect }) => {
		const { days } = range('2026-10-22', '2026-10-28')
		const ticks = getHourTicks(days[3].hours, 6)
		expect(ticks.map(({ span }) => span)).toEqual([6, 6, 6, 6, 1])
		expect(ticks.map(({ label }) => label)).toEqual(['00', '05', '11', '17', ''])
	})
})
