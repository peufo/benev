import { describe, it } from 'vitest'
import { Prisma } from '@prisma/client'
// Import direct des modules et non du barrel racine: celui-ci tire tout l'arbre UI,
// donc le CSS de tippy, que Vitest ne sait pas charger en environnement `node`.
import { USE_COERCE_JSON } from 'fuma'
import { parseFormData } from '$lib/server/fuma-legacy/parseFormData'
import { modelEventUpdate } from '$lib/models'
import { jsonOrDbNull } from '$lib/server'
import { mapUrl } from '$lib/location'

/** Reproduit la charge utile envoyée par InputLocation dans EventForm */
const submit = async (location?: unknown) => {
	const formData = new FormData()
	formData.append('id', 'mon-event')
	formData.append('name', 'Mon Event')
	if (location !== undefined) {
		// InputRelation sérialise aussi son propre champ de recherche
		formData.append('location_search', USE_COERCE_JSON + JSON.stringify({ id: 'W123' }))
		formData.append('location', USE_COERCE_JSON + JSON.stringify(location))
	}
	const { data } = await parseFormData(formData, modelEventUpdate)
	return data
}

describe('champ location du formulaire évènement', () => {
	it('transmet un lieu avec ses coordonnées', async ({ expect }) => {
		const location = {
			label: 'Place Bellecour, 69002 Lyon, France',
			coords: { lat: 45.75, lon: 4.83 },
		}
		expect((await submit(location)).location).toEqual(location)
	})

	it('accepte un lieu sans coordonnées, hérité de la migration', async ({ expect }) => {
		expect((await submit({ label: 'Saignelégier' })).location).toEqual({ label: 'Saignelégier' })
	})

	it('transmet `null` quand le lieu est effacé', async ({ expect }) => {
		expect((await submit(null)).location).toBeNull()
	})

	it('laisse la valeur en place quand le champ est absent', async ({ expect }) => {
		expect((await submit()).location).toBeUndefined()
	})

	it('refuse un libellé vide', async ({ expect }) => {
		await expect(submit({ label: '' })).rejects.toMatchObject({
			issues: [{ path: ['location', 'label'] }],
		})
	})

	// `z.json()` est une union (objet | chaîne JSON): une erreur imbriquée remonte
	// au niveau du champ et non sur le sous-champ fautif
	it('refuse des coordonnées incomplètes', async ({ expect }) => {
		await expect(submit({ label: 'X', coords: { lat: 1 } })).rejects.toMatchObject({
			issues: [{ path: ['location'] }],
		})
	})

	it("ignore le champ de recherche interne d'InputRelation", async ({ expect }) => {
		expect(await submit({ label: 'X' })).not.toHaveProperty('location_search')
	})
})

// la conversion vit côté serveur pour garder $lib/models exempt de runtime Prisma
describe('jsonOrDbNull', () => {
	it('convertit un effacement en DbNull, seule façon de vider une colonne Json', ({ expect }) => {
		expect(jsonOrDbNull(null)).toBe(Prisma.DbNull)
	})

	it('laisse passer une valeur et un champ absent', ({ expect }) => {
		expect(jsonOrDbNull({ label: 'X' })).toEqual({ label: 'X' })
		expect(jsonOrDbNull(undefined)).toBeUndefined()
	})
})

describe('mapUrl', () => {
	it('pointe les coordonnées exactes quand elles existent', ({ expect }) => {
		expect(mapUrl({ label: 'Place Bellecour', coords: { lat: 45.75, lon: 4.83 } })).toBe(
			'https://www.google.com/maps/search/?api=1&query=45.75%2C4.83'
		)
	})

	it('retombe sur une recherche textuelle sans coordonnées', ({ expect }) => {
		expect(mapUrl({ label: 'Château d’Erguël' })).toBe(
			'https://www.google.com/maps/search/?api=1&query=Ch%C3%A2teau%20d%E2%80%99Ergu%C3%ABl'
		)
	})
})
