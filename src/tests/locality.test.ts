import { describe, it } from 'vitest'
import { locality } from '$lib/location/locality'

describe('locality', () => {
	it('retient la localité derrière le code postal', ({ expect }) => {
		expect(locality('9 Allée des Soupirs, 2900 Porrentruy, Suisse')).toBe('Porrentruy')
	})

	it('ignore les segments qui précèdent, même nombreux', ({ expect }) => {
		expect(
			locality('Halle du Marché-Concours, 1 Place Général-Guisan, 2350 Saignelégier, Suisse')
		).toBe('Saignelégier')
	})

	it('accepte un code postal à 5 chiffres', ({ expect }) => {
		expect(locality('Place Bellecour, 69002 Lyon, France')).toBe('Lyon')
	})

	it('retombe sur le premier segment sans code postal', ({ expect }) => {
		expect(locality('Saignelégier')).toBe('Saignelégier')
		expect(locality('Chalet du Mont, Suisse')).toBe('Chalet du Mont')
	})

	it('ne confond pas un numéro de rue avec un code postal', ({ expect }) => {
		expect(locality('1 Place Général-Guisan, 2350 Saignelégier')).toBe('Saignelégier')
	})

	it('tolère un libellé vide ou bruité', ({ expect }) => {
		expect(locality('')).toBe('')
		expect(locality(' , , ')).toBe('')
	})
})
