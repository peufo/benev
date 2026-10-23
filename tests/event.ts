import { expect, type Page } from '@playwright/test'
import cuid from '@paralleldrive/cuid2'
import { mockPhoton } from './photon'
import { gotoHydrated } from './hydrated'

export function useEvent(name: string) {
	const eventCuid = cuid.createId()
	const eventName = `${name} ${eventCuid}`
	const eventId = `${name.toLowerCase()}-${eventCuid}`

	return {
		eventId,
		eventName,
		async create(page: Page) {
			await mockPhoton(page)
			await gotoHydrated(page, '/me/events/create')

			await page.getByLabel("Nom de l'évènement").fill(eventName)
			await expect(page.getByLabel("URL de l'évènement")).toHaveValue(eventId, {
				timeout: 1000,
			})

			await page.getByRole('button', { name: 'Créer mon évènement' }).click()
			// L'évènement s'ouvre sur sa gestion: les pages d'admin sont en `noindex`, leur titre
			// ne porte donc pas le nom. C'est l'entête qui l'affiche.
			await page.waitForURL(`**/${eventId}/admin/dashboard`)
			await expect(page.getByRole('link', { name: eventName })).toBeVisible()
		},
	}
}
