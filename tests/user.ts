import { expect, type Page } from '@playwright/test'
import cuid from '@paralleldrive/cuid2'

export function useUser(name: string) {
	// domaine .test (RFC 2606): jamais routable, aucun mail ne peut y arriver
	const email = `${name.toLowerCase()}-${cuid.createId()}@benevio.test`
	const password = '12341234'

	return {
		email,
		async register(page: Page) {
			await page.goto('/auth')
			await page.getByRole('button', { name: 'Nouveau compte' }).click()
			await page.getByLabel('Prénom').fill(name)
			await page.getByLabel('Nom', { exact: true }).fill('The Tester')
			await page.getByLabel('Email').fill(email)
			await page.getByLabel('Mot de passe').fill(password)
			await page.getByLabel('Je suis organisateur').check()
			await page.getByLabel("J'accepte les conditions d'utilisation").check()
			await page.getByRole('button', { name: 'Valider' }).click()
			await page.waitForURL('**/me/events')
		},
		async login(page: Page) {
			await page.goto('/auth')
			await page.getByLabel('Email').fill(email)
			await page.getByLabel('Mot de passe').fill(password)
			// l'onglet "Connexion" est un <span role=button>: on cible le vrai bouton
			await page
				.locator('button')
				.filter({ hasText: /^connexion$/i })
				.click()
			await page.waitForURL('**/me/events')
		},
		async expectConnected(page: Page) {
			await expect(page.getByRole('heading', { name: 'Mes évènements' })).toBeVisible()
		},
	}
}

export type User = ReturnType<typeof useUser>
