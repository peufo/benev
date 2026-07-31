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
		/**
		 * L'encodage des filtres de colonne est un contrat entre les `TableHead*` de fuma, qui
		 * l'écrivent dans l'URL, et les schémas de `$lib/models/filter`, qui le relisent. Rien
		 * ne relie les deux bouts: on constate ici qu'une URL filtrée passe bout en bout, là où
		 * `src/tests/filter.test.ts` ne vérifie que le schéma.
		 */
		async expectAdminFiltersAccepted(page: Page) {
			const cases: [string, string][] = [
				['members', 'subscribes_hours={"min":2,"max":8,"order":"asc"}'],
				['members', 'createdAt={"start":"2024-01-01T00:00:00.000Z","order":"desc"}'],
				['members', 'subscribes_teams=["a","b"]'],
				['members', 'isProfileComplet=true'],
				['members', 'age={"min":18}'],
				['subscribes', 'states=["accepted"]'],
				[
					'subscribes',
					'period={"start":"2024-01-01T00:00:00.000Z","end":"2025-01-01T00:00:00.000Z"}',
				],
				['subscribes', 'isAbsent=false'],
			]

			for (const [route, query] of cases) {
				const response = await page.goto(`/${eventId}/admin/${route}?${query}`)
				expect(response?.status(), `${route}?${query}`).toBeLessThan(400)
				// `ensureFieldsWithFilterAreVisibles` peut rediriger pour rendre la colonne
				// visible, mais le filtre lui-même doit survivre au passage.
				const key = query.split('=')[0]
				expect(new URL(page.url()).searchParams.has(key), `${route} garde ${key}`).toBe(true)
			}
		},
	}
}
