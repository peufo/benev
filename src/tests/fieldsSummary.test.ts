import { describe, it } from 'vitest'
import { combinationKey } from '../routes/[eventId]/admin/members/fieldsSummary'

describe('clé de combinaison de la synthèse', () => {
	const options = ['matin', 'midi', 'soir']

	it("ne dépend pas de l'ordre de saisie", ({ expect }) => {
		expect(combinationKey(['soir', 'matin'], options)).toBe(
			combinationKey(['matin', 'soir'], options)
		)
	})

	it("suit l'ordre des options du champ", ({ expect }) => {
		expect(combinationKey(['soir', 'matin', 'midi'], options)).toBe('["matin","midi","soir"]')
	})

	it('relègue les valeurs hors options à la fin, par ordre alphabétique', ({ expect }) => {
		expect(combinationKey(['zut', 'soir', 'ancien'], options)).toBe('["soir","ancien","zut"]')
	})

	it('distingue une combinaison de ses parties', ({ expect }) => {
		expect(combinationKey(['matin', 'soir'], options)).not.toBe(combinationKey(['matin'], options))
	})

	it('se relit comme le tableau attendu par le filtre de colonne', ({ expect }) => {
		expect(JSON.parse(combinationKey(['midi', 'matin'], options))).toEqual(['matin', 'midi'])
	})
})
