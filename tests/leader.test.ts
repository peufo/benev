import { expect, test, type Page } from '@playwright/test'
import { useEvent } from './event'
import { seedInvitedMember, seedTeam, seedUser, signIn } from './seed'
import { gotoHydrated } from './hydrated'

/**
 * Le journal était réservé aux administrateurs, alors que tout ce qu'il montre — coordonnées,
 * rôles, champs de profil — se lit déjà sur la fiche d'un membre, que les responsables ouvrent.
 * Rien d'autre ne couvre son ouverture: le reste du parcours se joue en propriétaire.
 */
test.describe.serial("Journal d'un responsable", () => {
	const event = useEvent('Journalerie')
	let page: Page
	let leadPage: Page

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
		leadPage = await browser.newPage()
	})
	test.afterAll(async () => {
		await page.close()
		await leadPage.close()
	})

	test('Préparation: un évènement, un secteur, un·e responsable invité·e', async () => {
		await signIn(page, await seedUser('Boss'))
		// L'évènement reste créé par l'interface: c'est lui qui écrit la ligne de journal lue plus bas.
		await event.create(page)

		const team = await seedTeam(event.eventId, 'Alpha')
		const lead = await seedUser('Lead')
		await seedInvitedMember(event.eventId, {
			firstName: 'Lead',
			lastName: 'The Tester',
			email: lead.email,
			leaderOf: [team.id],
		})
		await signIn(leadPage, lead)
	})

	test("Le responsable rejoint l'évènement", async () => {
		// L'adhésion relie la fiche semée au compte, son adresse étant vérifiée, et c'est elle
		// qui écrit la ligne que porte le fil du membre.
		await gotoHydrated(leadPage, `/${event.eventId}/register`)
		const accept = leadPage.getByRole('button', { name: 'Oui je le veux !' })
		await expect(accept).toBeVisible()
		await accept.click()
		await expect(accept).toBeHidden()
	})

	test('Il lit le journal, dans le tableau de bord comme sur une fiche', async () => {
		await gotoHydrated(leadPage, `/${event.eventId}/admin/dashboard`)
		const entries = leadPage.locator('#journal').getByRole('listitem')
		await expect(entries.filter({ hasText: "a créé l'évènement" })).toHaveCount(1)

		// Le fil de la fiche ne porte que le membre ouvert: la création de l'évènement en sort.
		await gotoHydrated(leadPage, `/${event.eventId}/admin/members`)
		await leadPage
			.getByRole('link', { name: /Lead The Tester/ })
			.first()
			.click()
		const memberEntries = leadPage.locator('#journal').getByRole('listitem')
		await expect(memberEntries.filter({ hasText: "a accepté l'invitation" })).toHaveCount(1)
		await expect(memberEntries.filter({ hasText: "a créé l'évènement" })).toHaveCount(0)
	})
})
