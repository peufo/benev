import { expect, test, type Page } from '@playwright/test'
import { useEvent } from './event'
import { seedInvitedMember, seedUser, signIn, verifyEmail, type SeededUser } from './seed'
import { gotoHydrated } from './hydrated'

/**
 * Reprendre une fiche créée par l'organisation demande d'avoir prouvé son adresse — le jeton reçu
 * par email, ou la vérification du compte. `acceptInvite` rapprochait sur la seule égalité des
 * adresses: ouvrir un compte au nom d'une personne invitée donnait sa fiche, profil, inscriptions
 * et rôles compris. L'état de l'évènement n'entre plus dans la question.
 */
test.describe.serial("Reprise d'une fiche invitée", () => {
	const event = useEvent('Reprise')
	/** Le compte de la personne invitée: ouvert, mais sans adresse prouvée. */
	let guest: SeededUser
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
		await signIn(page, await seedUser('Boss'))
		await event.create(page)

		guest = await seedUser('Guest', { isEmailVerified: false })
		await signIn(guestPage, guest)
		await seedInvitedMember(event.eventId, {
			firstName: 'Glados',
			lastName: 'Aperture',
			email: guest.email,
		})
	})

	test("Le registre propose la vérification sans attendre l'ouverture du tunnel", async () => {
		await gotoHydrated(guestPage, '/me/events')
		// Un fragment plutôt que la phrase: sa fin s'accorde au nombre d'invitations.
		await expect(guestPage.getByText('valider ton adresse email pour consulter')).toBeVisible()
		await guestPage.getByRole('button', { name: 'Confirmer' }).click()
		await expect(guestPage.getByText('Email de vérification envoyé')).toBeVisible()
	})

	test("Sans adresse prouvée, le tunnel ne propose pas l'adhésion", async () => {
		await gotoHydrated(guestPage, `/${event.eventId}/register`)
		await expect(
			guestPage.getByRole('heading', { name: 'Confirme ton adresse email' })
		).toBeVisible()
		await expect(guestPage.getByRole('button', { name: 'Oui je le veux !' })).toHaveCount(0)
	})

	test("L'adresse vérifiée, l'adhésion reprend la fiche au lieu d'en créer une seconde", async () => {
		await verifyEmail(guest)
		await gotoHydrated(guestPage, '/me/events')
		await expect(guestPage.getByText('valider ton adresse email pour consulter')).toHaveCount(0)

		await gotoHydrated(guestPage, `/${event.eventId}/register`)
		const accept = guestPage.getByRole('button', { name: 'Oui je le veux !' })
		await expect(accept).toBeVisible()
		await accept.click()
		await expect(accept).toBeHidden()

		// La liaison recopie les coordonnées du compte sur la fiche: le nom posé par
		// l'organisation disparaît. S'il restait, c'est qu'un second membre aurait été créé.
		await gotoHydrated(page, `/${event.eventId}/admin/members`)
		await expect(page.getByRole('link', { name: /Guest The Tester/ })).toHaveCount(1)
		await expect(page.getByRole('link', { name: /Glados Aperture/ })).toHaveCount(0)
	})
})
