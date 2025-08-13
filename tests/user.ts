import { expect, type Page } from '@playwright/test'
import cuid from '@paralleldrive/cuid2'

export function useUser(name: string) {
	const email = `${name}-${cuid.createId()}@benev.io`
	const password = '12341234'

	return {
		async register(page: Page) {
			await page.goto('/me')
			await page.getByRole('button', { name: 'Nouveau compte' }).click()
			await page.getByLabel('Prénom').click()
			await page.getByLabel('Prénom').fill(name)
			await page.getByLabel('Prénom').press('Tab')
			await page.getByLabel('Nom', { exact: true }).fill('The Tester')
			await page.getByLabel('Nom', { exact: true }).press('Tab')
			await page.getByLabel('Email').fill(email)
			await page.getByLabel('Email').press('Tab')
			await page.getByLabel('Mot de passe').fill(password)
			await page.getByRole('checkbox', { name: "J'accepte les conditions d'" }).check()
			await page.getByRole('button', { name: 'Valider' }).click()
			await page.waitForURL('/me/events')
		},
		async login(page: Page) {
			await page.goto('/me')
			await page.getByLabel('Email').fill(email)
			await page.getByLabel('Mot de passe').fill(password)
			await page.locator('button').filter({ hasText: 'Connexion' }).click()
			await page.waitForURL('/me/events')
		},
		expectConnected(page: Page) {
			expect(page.getByRole('heading', { name: 'Mes évènements' })).toBeVisible()
		},
	}
}

export type User = ReturnType<typeof useUser>
