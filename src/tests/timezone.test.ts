import { describe, it } from 'vitest'
import { timezoneOptions } from '$lib/timezone'
import { TIMEZONE_GROUPS, TIMEZONE_WINDOW_END } from '$lib/timezone.data'

const allZones = Intl.supportedValuesOf('timeZone')
const knownZones = new Set(TIMEZONE_GROUPS.flatMap((group) => group.zones))

describe('timezone.data', () => {
	// Les deux garde-fous du précalcul: passé la fenêtre les décalages affichés se figent, et une
	// zone ajoutée à tzdata depuis la génération n'est proposée à personne. Dans les deux cas:
	// `bun run timezones`.
	it('couvre encore au moins un an', ({ expect }) => {
		const inAYear = Date.now() / 1000 + 365 * 24 * 3600
		expect(TIMEZONE_WINDOW_END).toBeGreaterThan(inAYear)
	})

	it('connaît toutes les zones de ce runtime', ({ expect }) => {
		expect(allZones.filter((zone) => !knownZones.has(zone))).toEqual([])
	})
})

describe('timezoneOptions', () => {
	it('regroupe les zones équivalentes', ({ expect }) => {
		const options = timezoneOptions()
		expect(options.length).toBeLessThan(allZones.length / 4)
		expect(new Set(options.map((option) => option.value)).size).toBe(options.length)
	})

	it("n'expose que des identifiants IANA valides", ({ expect }) => {
		for (const { value } of timezoneOptions()) expect(allZones).toContain(value)
	})

	it('trie par décalage UTC croissant', ({ expect }) => {
		const minutes = timezoneOptions().map(({ label }) => {
			const [, sign, hours, mins] = label.match(/UTC([+-])(\d\d):(\d\d)/)!
			return (sign === '-' ? -1 : 1) * (Number(hours) * 60 + Number(mins))
		})
		expect([...minutes].sort((a, b) => a - b)).toEqual(minutes)
	})

	// Le décalage affiché doit suivre l'heure d'été, sans quoi la liste devient trompeuse la
	// moitié de l'année.
	it('affiche le décalage en vigueur aujourd’hui', ({ expect }) => {
		const paris = timezoneOptions('Europe/Paris').find((o) => o.value === 'Europe/Paris')!
		const format = new Intl.DateTimeFormat('en-US', {
			timeZone: 'Europe/Paris',
			timeZoneName: 'longOffset',
		})
		const actual = format.formatToParts(new Date()).find((p) => p.type === 'timeZoneName')!.value
		expect(paris.label).toContain(actual.replace('GMT', 'UTC'))
	})

	// Sans ça, un évènement dont le fuseau a été absorbé par un groupe verrait sa valeur
	// remplacée par la première option du select à la première soumission du formulaire.
	it('garde sélectionnable le fuseau déjà enregistré', ({ expect }) => {
		for (const zone of allZones) {
			const options = timezoneOptions(zone)
			expect(options.map((option) => option.value)).toContain(zone)
			expect(options).toHaveLength(timezoneOptions().length)
		}
	})

	it('conserve un fuseau absent du précalcul', ({ expect }) => {
		const values = timezoneOptions('Mars/Olympus').map((option) => option.value)
		expect(values).toContain('Mars/Olympus')
	})
})
