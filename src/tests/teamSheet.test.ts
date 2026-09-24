import { describe, it } from 'vitest'
import { teamSheet, type TeamSheetInput } from '$lib/team/teamSheet'

type Period = TeamSheetInput['periods'][number]

const person = (firstName: string, lastName: string, phone: string | null = null) => ({
	firstName,
	lastName,
	phone,
})

const period = (start: string, end: string, subscribes: Period['subscribes'] = []): Period => ({
	start: new Date(start),
	end: new Date(end),
	maxSubscribe: 4,
	tags: [],
	subscribes,
})

const team = (periods: Period[], leaders = [person('Léa', 'Martin', '079 000 00 00')]) => ({
	name: 'Bar',
	leaders,
	periods,
})

describe('teamSheet', () => {
	it("range les acceptées d'abord, puis les demandes en attente, chacune par nom", ({ expect }) => {
		const sheet = teamSheet(
			team([
				period('2026-07-11T06:00:00Z', '2026-07-11T10:00:00Z', [
					{ state: 'request', member: person('Anne', 'Aubert') },
					{ state: 'accepted', member: person('Zoé', 'Zurcher', '078 111 11 11') },
					{ state: 'accepted', member: person('Élodie', 'Bovet') },
				]),
			]),
			'Europe/Zurich'
		)
		expect(sheet.days[0].periods[0].rows).toEqual([
			{ name: 'Élodie Bovet', phone: '', pending: false },
			{ name: 'Zoé Zurcher', phone: '078 111 11 11', pending: false },
			{ name: 'Anne Aubert', phone: '', pending: true },
		])
	})

	it('écarte les refus et les annulations, du compte aussi', ({ expect }) => {
		const sheet = teamSheet(
			team([
				period('2026-07-11T06:00:00Z', '2026-07-11T10:00:00Z', [
					{ state: 'accepted', member: person('Anne', 'Aubert') },
					{ state: 'denied', member: person('Bob', 'Brun') },
					{ state: 'cancelled', member: person('Chloé', 'Cand') },
				]),
			]),
			'Europe/Zurich'
		)
		expect(sheet.days[0].periods[0].rows).toHaveLength(1)
		expect(sheet.days[0].periods[0].count).toBe('1 / 4')
	})

	it("lit les heures dans le fuseau de l'évènement", ({ expect }) => {
		const sheet = teamSheet(
			team([period('2026-07-11T06:00:00Z', '2026-07-11T10:30:00Z')]),
			'Europe/Zurich'
		)
		expect(sheet.days[0].label).toBe('Samedi 11.07.26')
		expect(sheet.days[0].periods[0].label).toBe('08:00 – 12:30')
		expect(sheet.range).toBe('samedi 11.07.26')
	})

	it('regroupe les créneaux par jour, dans le temps', ({ expect }) => {
		const sheet = teamSheet(
			team([
				period('2026-07-12T16:00:00Z', '2026-07-12T20:00:00Z'),
				period('2026-07-11T12:00:00Z', '2026-07-11T16:00:00Z'),
				period('2026-07-11T06:00:00Z', '2026-07-11T10:00:00Z'),
			]),
			'Europe/Zurich'
		)
		expect(
			sheet.days.map(({ label, periods }) => [label, periods.map(({ label }) => label)])
		).toEqual([
			['Samedi 11.07.26', ['08:00 – 12:00', '14:00 – 18:00']],
			['Dimanche 12.07.26', ['18:00 – 22:00']],
		])
		expect(sheet.range).toBe('samedi 11.07.26 au dimanche 12.07.26')
	})

	it('range un créneau de nuit sous son jour de début et nomme celui de sa fin', ({ expect }) => {
		const sheet = teamSheet(
			team([period('2026-07-11T20:00:00Z', '2026-07-12T01:00:00Z')]),
			'Europe/Zurich'
		)
		expect(sheet.days[0].label).toBe('Samedi 11.07.26')
		expect(sheet.days[0].periods[0].label).toBe('22:00 – dimanche 03:00')
	})

	it('garde la couleur des tags', ({ expect }) => {
		const tagged = { ...period('2026-07-11T06:00:00Z', '2026-07-11T10:00:00Z') }
		tagged.tags = [{ name: 'Montage', color: '#e69214' }]
		const sheet = teamSheet(team([tagged]), 'Europe/Zurich')
		expect(sheet.days[0].periods[0].tags).toEqual([{ name: 'Montage', color: '#e69214' }])
	})

	it('accole le téléphone du responsable quand il en a un', ({ expect }) => {
		const sheet = teamSheet(
			team([], [person('Léa', 'Martin', '079'), person('Marc', 'Roux')]),
			'UTC'
		)
		expect(sheet.leaders).toEqual(['Léa Martin (079)', 'Marc Roux'])
		expect(sheet.range).toBeNull()
	})
})
