import type { Page } from '@playwright/test'

export const testPlace = {
	label: 'Salle des fêtes, Rue du Test, 2800 Delémont, Suisse',
	lat: 47.3644,
	lon: 7.3439,
}

/** Photon est une API externe: on la fige pour garder les tests hermétiques */
export async function mockPhoton(page: Page) {
	await page.route('**/photon.komoot.io/**', (route) =>
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				features: [
					{
						properties: {
							osm_id: 1,
							osm_type: 'W',
							name: 'Salle des fêtes',
							street: 'Rue du Test',
							postcode: '2800',
							city: 'Delémont',
							country: 'Suisse',
						},
						geometry: { coordinates: [testPlace.lon, testPlace.lat] },
					},
				],
			}),
		})
	)
}
