import { expect, test } from '@playwright/test'

test('Open landing page', async ({ page }) => {
	await page.goto('/')
	await expect(page.getByRole('heading', { name: 'Benev.io' })).toBeVisible()
	await expect(page).toHaveTitle(/Benev\.io/)
})

test('User register', async ({ page }) => {
	await page.goto('http://localhost:5173/')
	await page.getByRole('link', { name: 'Essayer maintenant' }).click()
	await page.getByRole('button', { name: 'Nouveau compte' }).click()
	await page.getByLabel('Prénom').click()
	await page.getByLabel('Prénom').fill('Bob')
	await page.getByLabel('Prénom').press('Tab')
	await page.getByLabel('Nom', { exact: true }).fill('Tester')
	await page.getByLabel('Nom', { exact: true }).press('Tab')
	await page.getByLabel('Email').fill('bob.dada@benev.io')
	await page.getByLabel('Email').press('Tab')
	await page.getByLabel('Mot de passe').fill('12341234')
	await page.getByLabel('Nom', { exact: true }).dblclick()
	await page.getByLabel("J'accepte\n\t\t\t\t\t\tles conditions d'utilisation").check()
	await page.getByRole('button', { name: 'Valider' }).click()
	await expect(page.locator('main')).toHaveText('Mes évènements')
})

test('Create an event', async ({ page }) => {
	await page.getByRole('button', { name: 'Organiser' }).click()
	await page.getByRole('button', { name: 'Oui, je le veux' }).click()
	await page.getByLabel("Nom de l'évènement").fill('Skate contest')
})
