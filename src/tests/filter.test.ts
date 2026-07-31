import { describe, it } from 'vitest'
import { filterBoolean, filterMultiselect, filterNumber, filterRange } from '$lib/models/filter'

/**
 * Ces schémas relisent ce que les composants `TableHead*` de fuma écrivent dans l'URL. Les deux
 * bouts ne sont reliés ni par le typage ni par le reste des tests: seul ce fichier constate que
 * l'encodage attendu est bien celui qui est produit. Les chaînes ci-dessous sont donc à recopier
 * depuis les composants de fuma, pas à réécrire à la main.
 */
describe('contrat des filtres de colonne', () => {
	it('lit un intervalle numérique', ({ expect }) => {
		const parsed = filterNumber.parse('{"min":2,"max":5,"order":"asc"}')
		expect(parsed).toEqual({ min: 2, max: 5, order: 'asc' })
	})

	it('accepte un intervalle numérique partiel', ({ expect }) => {
		expect(filterNumber.parse('{"min":2}')).toEqual({ min: 2 })
		expect(filterNumber.parse('{"order":"desc"}')).toEqual({ order: 'desc' })
	})

	it('lit une plage de dates', ({ expect }) => {
		const parsed = filterRange.parse('{"start":"2024-06-01T00:00:00.000Z","order":"desc"}')
		expect(parsed?.start).toEqual(new Date('2024-06-01T00:00:00.000Z'))
		expect(parsed?.order).toBe('desc')
	})

	it('lit une sélection multiple', ({ expect }) => {
		expect(filterMultiselect.parse('["a","b"]')).toEqual(['a', 'b'])
		expect(filterMultiselect.parse('[]')).toEqual([])
	})

	// `TableHeadBoolean` délègue à un select simple: la valeur reste brute, sans JSON.
	it('lit un booléen en valeur brute', ({ expect }) => {
		expect(filterBoolean.parse('true')).toBe(true)
		expect(filterBoolean.parse('false')).toBe(false)
	})

	// `parseQuery` n'insère la clé que si le paramètre est présent et non vide.
	it('laisse passer un filtre absent', ({ expect }) => {
		expect(filterNumber.parse(undefined)).toBeUndefined()
		expect(filterRange.parse(undefined)).toBeUndefined()
		expect(filterMultiselect.parse(undefined)).toBeUndefined()
		expect(filterBoolean.parse(undefined)).toBeUndefined()
	})

	it('rejette un JSON invalide plutôt que de filtrer sur du vide', ({ expect }) => {
		expect(filterNumber.safeParse('{oops').success).toBe(false)
		expect(filterMultiselect.safeParse('pas du json').success).toBe(false)
		expect(filterBoolean.safeParse('oui').success).toBe(false)
	})

	// `getMembers.server.ts` réutilise ces schémas hors `parseQuery`, sur la valeur brute d'un
	// paramètre `field_<id>`, pour filtrer les champs de membre dynamiques.
	it('accepte aussi une valeur déjà désérialisée', ({ expect }) => {
		expect(filterNumber.parse({ min: 1 })).toEqual({ min: 1 })
		expect(filterMultiselect.parse(['x'])).toEqual(['x'])
	})
})
