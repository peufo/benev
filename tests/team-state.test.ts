import { expect, test, type Page } from '@playwright/test'
import { useUser } from './user'
import { useEvent } from './event'

/**
 * Un secteur naît en brouillon: les bénévoles ne le voient pas avant qu'on le publie, et le
 * journal garde la trace du passage.
 */
test.describe.serial("Statut d'un secteur", () => {
	const boss = useUser('Boss')
	const guest = useUser('Guest')
	const event = useEvent(boss, 'Statut')
	let page: Page
	let guestPage: Page

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
		guestPage = await browser.newPage()
	})
	test.afterAll(async () => {
		await page.close()
		await guestPage.close()
	})

	test('Préparation: un évènement publié, un secteur en brouillon, un bénévole', async () => {
		await boss.register(page)
		await event.create(page)

		await page.goto(`/${event.eventId}/admin/settings`)
		await page.getByRole('button', { name: 'Publier', exact: true }).click()
		await expect(page.getByText('Évènement publié').first()).toBeVisible()

		await page.goto(`/${event.eventId}/admin/teams`)
		const newTeam = page.locator('a[href*="form_team=%7B%7D"]').first()
		const teamDrawer = page.getByRole('dialog', { name: 'Nouveau secteur' })
		await expect(async () => {
			await newTeam.click()
			await expect(teamDrawer).toBeVisible({ timeout: 1000 })
		}).toPass()
		const teamName = teamDrawer.getByLabel('Nom du secteur')
		await expect(async () => {
			await teamName.fill('Alpha')
			await expect(teamName).toHaveValue('Alpha', { timeout: 1000 })
		}).toPass()
		await teamDrawer.getByRole('button', { name: 'Valider', exact: true }).click()
		await expect(page.getByText('Secteur créé en brouillon')).toBeVisible()
		await expect(page.getByRole('button', { name: 'Brouillon', exact: true })).toBeVisible()

		await guest.register(guestPage)
		await guest.verifyEmail()
		await guestPage.goto(`/${event.eventId}/register`)
		const accept = guestPage.getByRole('button', { name: 'Oui je le veux !' })
		await expect(accept).toBeVisible()
		await accept.click()
		await expect(accept).toBeHidden()
	})

	test('Le brouillon est invisible du bénévole, le secteur publié se montre', async () => {
		await guestPage.goto(`/${event.eventId}/teams`)
		await expect(guestPage.getByText('Pas de secteur')).toBeVisible()
		await expect(guestPage.getByText('Alpha')).toHaveCount(0)

		await page.goto(`/${event.eventId}/admin/teams`)
		await page.getByRole('link', { name: 'Alpha' }).click()
		// Le statut est un menu dans les actions de la carte: son bouton porte l'état courant.
		// Quitter le brouillon se confirme (les courriels partent), et ne se défait pas.
		await page.getByRole('button', { name: 'Brouillon', exact: true }).click()
		page.once('dialog', (confirmation) => {
			expect(confirmation.message()).toContain('Aucun courriel à envoyer')
			void confirmation.accept()
		})
		await page.getByRole('button', { name: 'Valider et ouvrir les inscriptions' }).click()
		await expect(page.getByText('Publié', { exact: true }).first()).toBeVisible()
		await page.getByRole('button', { name: 'Publié', exact: true }).click()
		await expect(page.getByRole('button', { name: 'Fermer les inscriptions' })).toBeVisible()
		await expect(page.getByRole('button', { name: /brouillon/i })).toHaveCount(0)
		await page.keyboard.press('Escape')

		await guestPage.reload()
		await expect(guestPage.getByRole('heading', { name: 'Alpha' })).toBeVisible()

		await page.goto(`/${event.eventId}/admin/dashboard`)
		const entries = page.locator('#journal').getByRole('listitem')
		await expect(entries.filter({ hasText: 'a changé le statut du secteur Alpha' })).toHaveCount(1)
	})
})
