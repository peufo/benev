import { expect, type Page } from '@playwright/test'
import cuid from '@paralleldrive/cuid2'
import type { User } from './user'
import { mockPhoton, testPlace } from './photon'

export function useEvent(owner: User, name: string) {
	const eventCuid = cuid.createId()
	const eventName = `${name} ${eventCuid}`
	const eventId = `${name.toLowerCase()}-${eventCuid}`

	return {
		eventId,
		eventName,
		async create(page: Page) {
			await mockPhoton(page)
			await page.goto('/me/events/create')

			await page.getByLabel("Nom de l'évènement").fill(eventName)
			await expect(page.getByLabel("URL de l'évènement")).toHaveValue(eventId)

			await page
				.getByRole('button', { name: /Pied de page/i })
				.first()
				.click()
			// Le champ de recherche vit dans le popover d'`InputRelation`: il faut l'ouvrir d'abord.
			await page.getByLabel('Lieu', { exact: true }).click()
			await page.locator('input[placeholder="Recherche"]:visible').fill('salle des fetes')
			await page
				.locator('li, [role="option"]')
				.filter({ hasText: 'Salle des fêtes' })
				.first()
				.click()

			await page.getByRole('button', { name: 'Valider', exact: true }).last().click()
			await page.waitForURL(`**/${eventId}`)
			await expect(page).toHaveTitle(new RegExp(eventName))
		},
		async gotoPublic(page: Page) {
			await page.goto(`/${eventId}`)
			await expect(page).toHaveTitle(new RegExp(eventName))
		},
		/**
		 * Le lieu est stocké en Json (`Event.location`) puis rendu en pied de page.
		 * Un bug de sérialisation a déjà écrit un booléen dans cette colonne sans que
		 * rien ne le détecte: cette assertion ferme la porte.
		 */
		async expectLocationInFooter(page: Page) {
			const link = page.getByRole('link', { name: new RegExp(testPlace.label, 'i') })
			await expect(link).toBeVisible()
			await expect(link).toHaveAttribute(
				'href',
				`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
					`${testPlace.lat},${testPlace.lon}`
				)}`
			)
		},
	}
}
