import { expect, test, type Page } from '@playwright/test'
import cuid from '@paralleldrive/cuid2'

test('Open landing page', async ({ page }) => {
	await page.goto('/')
	await expect(page.getByRole('heading', { name: 'Benev.io' })).toBeVisible()
	await expect(page).toHaveTitle(/Benev\.io/)
})

test.describe('New user and new event', () => {
	const testerId = cuid.createId()
	const randomEventId = cuid.createId()
	const eventName = `Test event ${randomEventId}`

	test.beforeEach(async ({ page }) => login(page))

	const userIsLogged = async (page: Page) => {
		return expect(page.getByRole('heading', { name: 'Mes évènements' }))
			.toBeVisible()
			.then(() => true)
			.catch(() => false)
	}

	async function login(page: Page) {
		if (await userIsLogged(page)) return
		await page.goto('/me')
		await page.getByLabel('Email').fill(`bob-${testerId}@benev.io`)
		await page.getByLabel('Mot de passe').fill('12341234')
		await page.locator('button').filter({ hasText: 'Connexion' }).click()

		if (await userIsLogged(page)) return
		await page.getByRole('button', { name: 'Nouveau compte' }).click()
		await page.getByLabel('Prénom').click()
		await page.getByLabel('Prénom').fill('Bob')
		await page.getByLabel('Prénom').press('Tab')
		await page.getByLabel('Nom', { exact: true }).fill(testerId)
		await page.getByLabel('Nom', { exact: true }).press('Tab')
		await page.getByLabel('Email').fill(`bob-${testerId}@benev.io`)
		await page.getByLabel('Email').press('Tab')
		await page.getByLabel('Mot de passe').fill('12341234')
		await page.getByLabel('Nom', { exact: true }).dblclick()
		await page.getByLabel("J'accepte\n\t\t\t\t\t\tles conditions d'utilisation").check()
		await page.getByRole('button', { name: 'Valider' }).click()
	}

	test('User login', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Mes évènements' })).toBeVisible()
	})

	test('Create an event', async ({ page }) => {
		await page.goto('/me')
		await page.getByRole('button', { name: 'Organiser' }).click()
		await page.getByRole('button', { name: 'Oui, je le veux' }).click()
		await page.getByLabel("Nom de l'évènement").fill(eventName)
		await expect(page.getByLabel("URL de l'évènement")).toHaveValue(`test-event-${randomEventId}`)
		await page.locator('button[type="submit"]').click()
		await expect(page).toHaveTitle(`Benev.io - ${eventName}`)
	})
})
