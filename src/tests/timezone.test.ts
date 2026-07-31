import { describe, it } from 'vitest'
import { timezoneOptions } from '$lib/timezone'

const allZones = Intl.supportedValuesOf('timeZone')

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

	// Sans ça, un évènement dont le fuseau a été absorbé par un groupe verrait sa valeur
	// remplacée par la première option du select à la première soumission du formulaire.
	it('garde sélectionnable le fuseau déjà enregistré', ({ expect }) => {
		for (const zone of allZones) {
			const options = timezoneOptions(zone)
			expect(options.map((option) => option.value)).toContain(zone)
			expect(options).toHaveLength(timezoneOptions().length)
		}
	})

	it('conserve un fuseau que le moteur ne connaît pas', ({ expect }) => {
		const values = timezoneOptions('Mars/Olympus').map((option) => option.value)
		expect(values).toContain('Mars/Olympus')
	})
})
