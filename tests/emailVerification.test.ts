import { expect, test, type Page } from '@playwright/test'
import { seedEmailVerificationToken, seedUser, signIn, type SeededUser } from './seed'
import { awaitHydrated, gotoHydrated } from './hydrated'

/**
 * Le lien de vérification confirme l'adresse à laquelle il a été envoyé — c'est tout ce que prouve
 * le jeton — mais il ne remplace plus la session ouverte par un autre compte, ni ne ferme celles
 * du compte visé.
 */
test.describe.serial('Lien de vérification ouvert depuis un autre compte', () => {
	let alice: SeededUser
	let bob: SeededUser
	// `browser.newPage()` ouvre un contexte par page: les deux sessions ne partagent pas de cookie.
	let alicePage: Page
	let bobPage: Page
	let link: string

	test.beforeAll(async ({ browser }) => {
		alicePage = await browser.newPage()
		bobPage = await browser.newPage()
	})
	test.afterAll(async () => {
		await alicePage.close()
		await bobPage.close()
	})

	test('Préparation: deux comptes, un lien pour le premier', async () => {
		alice = await seedUser('Alice', { isEmailVerified: false })
		bob = await seedUser('Bob')
		await signIn(alicePage, alice)
		await signIn(bobPage, bob)
		link = `/token/${await seedEmailVerificationToken(alice)}/email_verification`

		await gotoHydrated(alicePage, '/me/account')
		await expect(alicePage.getByText('Email non verifié')).toBeVisible()
	})

	test("L'adresse est confirmée, la session ouverte n'est pas remplacée", async () => {
		await gotoHydrated(bobPage, link)
		await expect(bobPage.getByRole('heading', { name: 'Adresse confirmée' })).toBeVisible()
		await expect(bobPage.getByText(alice.email)).toBeVisible()
		await expect(bobPage.getByText(bob.email)).toBeVisible()

		// La session d'Alice, ouverte ailleurs, a survécu au clic — et voit l'adresse confirmée.
		await alicePage.reload()
		await awaitHydrated(alicePage)
		await expect(alicePage.getByText('Email non verifié')).toBeHidden()
	})

	test('« Rester avec mon compte » laisse la session en place', async () => {
		await bobPage.getByRole('link', { name: 'Rester avec mon compte' }).click()
		await bobPage.waitForURL('**/me/events')
		await gotoHydrated(bobPage, '/me/account')
		await expect(bobPage.getByText(bob.email)).toBeVisible()
	})

	test('« Changer de compte » ouvre celle du compte visé', async () => {
		// Le jeton a survécu au premier passage: c'est lui qui ouvre la session au rechargement.
		await gotoHydrated(bobPage, link)
		await bobPage.getByRole('button', { name: 'Changer de compte' }).click()
		await bobPage.waitForURL('**/me/events')
		await gotoHydrated(bobPage, '/me/account')
		await expect(bobPage.getByText(alice.email)).toBeVisible()
	})

	test('Le jeton, lui, est consommé', async () => {
		await gotoHydrated(bobPage, link)
		await bobPage.waitForURL('**/me/events')
		await expect(bobPage.getByRole('heading', { name: 'Adresse confirmée' })).toBeHidden()
	})
})
