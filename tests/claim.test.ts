import { expect, test, type Page } from '@playwright/test'
import { useUser } from './user'
import { useEvent } from './event'

/**
 * Reprendre une fiche créée par l'organisation demande d'avoir prouvé son adresse — le jeton reçu
 * par email, ou la vérification du compte. `acceptInvite` rapprochait sur la seule égalité des
 * adresses: ouvrir un compte au nom d'une personne invitée donnait sa fiche, profil, inscriptions
 * et rôles compris. L'état de l'évènement n'entre plus dans la question.
 */
test.describe.serial("Reprise d'une fiche invitée", () => {
	const boss = useUser('Boss')
	const guest = useUser('Guest')
	const event = useEvent(boss, 'Reprise')
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

	test('Préparation: un évènement, une invitation, un compte non vérifié', async () => {
		await boss.register(page)
		await event.create(page)
		await guest.register(guestPage)

		await page.goto(`/${event.eventId}/admin/members?form_invite=1`)
		const dialog = page.getByRole('dialog')
		await dialog.getByLabel('Prénom').fill('Glados')
		// `exact`: « Prénom » contient « nom ».
		await dialog.getByLabel('Nom', { exact: true }).fill('Aperture')
		await dialog.getByLabel('Email (optionnel)', { exact: true }).fill(guest.email)
		await dialog.getByRole('button', { name: 'Valider' }).click()
		await expect(dialog).toBeHidden()
	})

	test("Le registre propose la vérification sans attendre l'ouverture du tunnel", async () => {
		await guestPage.goto('/me/events')
		// Un fragment plutôt que la phrase: sa fin s'accorde au nombre d'invitations.
		await expect(guestPage.getByText('valider ton adresse email pour consulter')).toBeVisible()
		await guestPage.getByRole('button', { name: 'Confirmer' }).click()
		await expect(guestPage.getByText('Email de vérification envoyé')).toBeVisible()
	})

	test("Sans adresse prouvée, le tunnel ne propose pas l'adhésion", async () => {
		await guestPage.goto(`/${event.eventId}/register`)
		await expect(
			guestPage.getByRole('heading', { name: 'Confirme ton adresse email' })
		).toBeVisible()
		await expect(guestPage.getByRole('button', { name: 'Oui je le veux !' })).toHaveCount(0)
	})

	test("L'adresse vérifiée, l'adhésion reprend la fiche au lieu d'en créer une seconde", async () => {
		await guest.verifyEmail()
		await guestPage.goto('/me/events')
		await expect(guestPage.getByText('valider ton adresse email pour consulter')).toHaveCount(0)

		await guestPage.goto(`/${event.eventId}/register`)
		const accept = guestPage.getByRole('button', { name: 'Oui je le veux !' })
		await expect(accept).toBeVisible()
		await accept.click()
		await expect(accept).toBeHidden()

		// La liaison recopie les coordonnées du compte sur la fiche: le nom posé par
		// l'organisation disparaît. S'il restait, c'est qu'un second membre aurait été créé.
		await page.goto(`/${event.eventId}/admin/members`)
		await expect(page.getByRole('link', { name: /Guest The Tester/ })).toHaveCount(1)
		await expect(page.getByRole('link', { name: /Glados Aperture/ })).toHaveCount(0)
	})
})
