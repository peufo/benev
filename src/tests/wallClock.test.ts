import { it } from 'vitest'
import { fromWallClock, shiftDays, wallClock } from '#lib/wallClock.js'
import { describeInSystemZones } from './systemZones'

const ZONE = 'Europe/Zurich'

describeInSystemZones('wallClock', (system) => {
	it('tourne bien dans le fuseau de machine annoncé', ({ expect }) => {
		expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(system)
		expect(new Date('2026-07-01T12:00:00Z').getTimezoneOffset()).toBe(
			{ UTC: 0, 'Europe/Zurich': -120, 'America/New_York': 240, 'Pacific/Auckland': -720 }[system]
		)
	})

	it("lit l'heure murale de l'évènement", ({ expect }) => {
		const wall = wallClock(Date.parse('2026-10-25T08:00:00Z'), ZONE)
		expect(new Date(wall).toISOString()).toBe('2026-10-25T09:00:00.000Z')
	})

	it("retrouve l'instant d'une heure murale, des deux côtés d'une bascule", ({ expect }) => {
		expect(new Date(fromWallClock(Date.parse('2026-10-24T10:00:00Z'), ZONE)).toISOString()).toBe(
			'2026-10-24T08:00:00.000Z'
		)
		expect(new Date(fromWallClock(Date.parse('2026-10-25T10:00:00Z'), ZONE)).toISOString()).toBe(
			'2026-10-25T09:00:00.000Z'
		)
	})

	it("prend la seconde occurrence d'une heure doublée, et l'heure qui suit une heure sautée", ({
		expect,
	}) => {
		expect(new Date(fromWallClock(Date.parse('2026-10-25T02:30:00Z'), ZONE)).toISOString()).toBe(
			'2026-10-25T01:30:00.000Z'
		)
		expect(new Date(fromWallClock(Date.parse('2026-03-29T02:30:00Z'), ZONE)).toISOString()).toBe(
			'2026-03-29T01:30:00.000Z'
		)
	})

	it("décale d'un jour sans bouger l'heure, à travers le passage à l'heure d'hiver", ({
		expect,
	}) => {
		// Samedi 10:00 CEST, dimanche 10:00 CET: 25 heures plus tard.
		expect(shiftDays(new Date('2026-10-24T08:00:00Z'), 1, ZONE).toISOString()).toBe(
			'2026-10-25T09:00:00.000Z'
		)
	})

	it("décale d'un jour sans bouger l'heure, à travers le passage à l'heure d'été", ({ expect }) => {
		expect(shiftDays(new Date('2026-03-28T09:00:00Z'), 1, ZONE).toISOString()).toBe(
			'2026-03-29T08:00:00.000Z'
		)
	})

	it("garde l'heure d'une édition à la suivante, d'une saison à l'autre", ({ expect }) => {
		// 364 jours: le dimanche 25 octobre 2026 (CET) devient le dimanche 24 octobre 2027 (CEST).
		expect(shiftDays(new Date('2026-10-25T09:00:00Z'), 364, ZONE).toISOString()).toBe(
			'2027-10-24T08:00:00.000Z'
		)
	})

	it('recule aussi bien', ({ expect }) => {
		expect(shiftDays(new Date('2026-10-25T09:00:00Z'), -1, ZONE).toISOString()).toBe(
			'2026-10-24T08:00:00.000Z'
		)
	})
})
