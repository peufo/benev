import { test, type Page } from '@playwright/test'
import { useEvent } from './event'
import { seedUser, signIn, type SeededUser } from './seed'

test.describe.serial('Membres et invitations', () => {
	const event = useEvent('Membres')
	let owner: SeededUser
	let page: Page

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
	})
	test.afterAll(async () => {
		await page.close()
	})

	test('Préparation: un évènement', async () => {
		owner = await seedUser('Bob')
		await signIn(page, owner)
		await event.create(page)
	})

	test('Le formulaire de champ de profil suit le type et les droits', async () => {
		await event.expectMemberFieldForm(page)
	})

	// Après le champ « Ville », que la fiche édite.
	test("Le profil du membre s'édite sur sa fiche, par la barre de sauvegarde", async () => {
		await event.expectMemberProfileSaveBar(page)
	})

	test("L'invitation reconnaît un compte existant", async () => {
		await event.expectInviteFindsExistingUser(page, owner.email)
	})

	test("L'invitation refuse une adresse déjà membre", async () => {
		await event.expectInviteRejectsDuplicateEmail(page, owner.email)
	})

	test("L'invitation se renvoie depuis la fiche du membre", async () => {
		await event.expectResendInvite(page)
	})

	test("Un invité refuse l'invitation et son adresse quitte la fiche", async ({
		browser: invitedBrowser,
	}) => {
		// Le compte existe avant l'invitation: c'est le cas ordinaire, et le tunnel rattache
		// alors le membre par son adresse, une fois celle-ci prouvée.
		const chell = await seedUser('Chell', { isEmailVerified: false })
		const invitedPage = await invitedBrowser.newPage()
		try {
			await signIn(invitedPage, chell)
			await event.expectDeclineInvite(page, invitedPage, chell)
		} finally {
			await invitedPage.close()
		}
	})
})
