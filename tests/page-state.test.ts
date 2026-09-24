import { expect, test, type Page } from '@playwright/test'
import { useEvent } from './event'
import { seedMember, seedUser, signIn } from './seed'
import { gotoHydrated } from './hydrated'

/**
 * Une page naît en brouillon: elle n'entre au menu du site qu'une fois publiée, et son adresse
 * n'existe pas pour qui n'organise pas.
 */
test.describe.serial("Statut d'une page", () => {
	const event = useEvent('Page')
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

	test('Préparation: un évènement publié, un bénévole', async () => {
		await signIn(page, await seedUser('Boss'))
		await event.create(page)

		await gotoHydrated(page, `/${event.eventId}/admin/settings`)
		await page.getByRole('button', { name: 'Publier', exact: true }).click()
		await expect(page.getByText('Évènement publié').first()).toBeVisible()

		const guest = await seedUser('Guest')
		await seedMember(event.eventId, guest)
		await signIn(guestPage, guest)
	})

	test('Une page naît en brouillon et entre au menu une fois publiée', async () => {
		await gotoHydrated(page, `/${event.eventId}/admin/pages`)
		await page
			.locator('section')
			.filter({ hasText: 'Navigation' })
			.getByRole('button')
			.first()
			.click()
		await page.waitForURL('**/admin/pages/**')
		await expect(page.getByText('Nouvelle page créée, en brouillon')).toBeVisible()
		await expect(page.getByRole('button', { name: 'Statut' })).toContainText('Brouillon')
		// « Page N »: le rang compte l'accueil, le titre se lit plutôt qu'il ne se devine.
		const title = await page.getByLabel('Titre').inputValue()
		const path = title.toLowerCase().replaceAll(' ', '-')

		// Le menu public ignore le brouillon, et son adresse n'existe pas pour un bénévole.
		await gotoHydrated(guestPage, `/${event.eventId}`)
		await expect(guestPage.getByRole('link', { name: 'Bienvenue' }).first()).toBeVisible()
		await expect(guestPage.getByRole('link', { name: title })).toHaveCount(0)
		const response = await gotoHydrated(guestPage, `/${event.eventId}/${path}`)
		expect(response?.status()).toBe(404)

		// Le statut est un champ du formulaire: il se choisit, puis s'enregistre avec le reste.
		await page.getByRole('button', { name: 'Statut' }).click()
		await page.getByRole('option', { name: 'Page publiée' }).click()
		await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
		await expect(page.getByText('Page enregistrée').first()).toBeVisible()
		await gotoHydrated(guestPage, `/${event.eventId}`)
		await expect(guestPage.getByRole('link', { name: title }).first()).toBeVisible()

		// Une ligne du volet porte une poignée de glissé: le clic ailleurs sur la ligne doit
		// rester une navigation, ce que le clic sur l'accueil, sans poignée, ne prouve pas.
		await gotoHydrated(page, `/${event.eventId}/admin/pages`)
		await page.locator('aside').getByRole('link', { name: title }).click()
		await page.waitForURL('**/admin/pages/**')
		await expect(page.getByLabel('Titre')).toHaveValue(title)
	})
})
