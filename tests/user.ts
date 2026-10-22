import { expect, type Page } from '@playwright/test'
import cuid from '@paralleldrive/cuid2'
import { gotoHydrated } from './hydrated'

/**
 * Le compte créé par le formulaire, pour les seuls tests qui portent sur l'inscription elle-même.
 * Partout ailleurs, `seedUser` et `signIn` de `./seed` ouvrent la session sans y passer.
 */
export function useUser(name: string) {
	// domaine .test (RFC 2606): jamais routable, aucun mail ne peut y arriver
	const email = `${name.toLowerCase()}-${cuid.createId()}@benevio.test`
	const password = '12341234'

	async function register(page: Page) {
		await gotoHydrated(page, '/auth')
		await page.getByRole('button', { name: 'Créer un compte' }).click()
		await page.getByLabel('Prénom').fill(name)
		await page.getByLabel('Nom', { exact: true }).fill('The Tester')
		await page.getByLabel('Email').fill(email)
		await page.getByLabel('Mot de passe').fill(password)
		// `InputBoolean` réduit la vraie case à `w-0` et dessine son état à côté:
		// Playwright la juge invisible, on clique donc le label qui l'enveloppe.
		// Le viser par `label` évite le lien homonyme du pied de formulaire.
		await page.locator('label').filter({ hasText: 'Je suis organisateur' }).click()
		await page.locator('label').filter({ hasText: "J'accepte les conditions" }).click()
		await page.getByRole('button', { name: 'Créer mon compte' }).click()
		await page.waitForURL('**/me/events')
	}

	return {
		email,
		register,
		async login(page: Page) {
			await gotoHydrated(page, '/auth')
			await page.getByLabel('Email').fill(email)
			await page.getByLabel('Mot de passe').fill(password)
			await page.getByRole('button', { name: 'Se connecter' }).click()
			await page.waitForURL('**/me/events')
		},
		async expectConnected(page: Page) {
			await expect(page.getByRole('heading', { name: 'Mes évènements' })).toBeVisible()
		},
	}
}
