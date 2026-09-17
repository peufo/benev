import { expect, test, type Page } from '@playwright/test'
import { useUser } from './user'
import { useEvent } from './event'

/**
 * Une page naît en brouillon: elle n'entre au menu du site qu'une fois publiée, et son adresse
 * n'existe pas pour qui n'organise pas.
 */
test.describe.serial("Statut d'une page", () => {
	const boss = useUser('Boss')
	const guest = useUser('Guest')
	const event = useEvent(boss, 'Page')
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
		await boss.register(page)
		await event.create(page)

		await page.goto(`/${event.eventId}/admin/settings`)
		await page.getByRole('button', { name: 'Publier', exact: true }).click()
		await expect(page.getByText('Évènement publié').first()).toBeVisible()

		await guest.register(guestPage)
		await guest.verifyEmail()
		await guestPage.goto(`/${event.eventId}/register`)
		const accept = guestPage.getByRole('button', { name: 'Oui je le veux !' })
		await expect(accept).toBeVisible()
		await accept.click()
		await expect(accept).toBeHidden()
	})

	test('Une page naît en brouillon et entre au menu une fois publiée', async () => {
		await page.goto(`/${event.eventId}/admin/pages`)
		await page
			.locator('section')
			.filter({ hasText: 'Navigation' })
			.getByRole('button')
			.first()
			.click()
		await page.waitForURL('**/admin/pages/**')
		await expect(page.getByText('Nouvelle page créée, en brouillon')).toBeVisible()
		await expect(page.getByRole('button', { name: 'Brouillon', exact: true })).toBeVisible()
		// « Page N »: le rang compte l'accueil, le titre se lit plutôt qu'il ne se devine.
		const title = await page.getByLabel('Titre').inputValue()
		const path = title.toLowerCase().replaceAll(' ', '-')

		// Le menu public ignore le brouillon, et son adresse n'existe pas pour un bénévole.
		await guestPage.goto(`/${event.eventId}`)
		await expect(guestPage.getByRole('link', { name: 'Bienvenue' }).first()).toBeVisible()
		await expect(guestPage.getByRole('link', { name: title })).toHaveCount(0)
		const response = await guestPage.goto(`/${event.eventId}/${path}`)
		expect(response?.status()).toBe(404)

		await page.getByRole('button', { name: 'Brouillon', exact: true }).click()
		await page.getByRole('button', { name: 'Publier', exact: true }).click()
		await expect(page.getByText('Page publiée').first()).toBeVisible()
		await guestPage.goto(`/${event.eventId}`)
		await expect(guestPage.getByRole('link', { name: title }).first()).toBeVisible()

		// Une ligne du volet porte une poignée de glissé: le clic ailleurs sur la ligne doit
		// rester une navigation, ce que le clic sur l'accueil, sans poignée, ne prouve pas.
		await page.goto(`/${event.eventId}/admin/pages`)
		await page.locator('aside').getByRole('link', { name: title }).click()
		await page.waitForURL('**/admin/pages/**')
		await expect(page.getByLabel('Titre')).toHaveValue(title)
	})
})
