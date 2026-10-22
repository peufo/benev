import { test, type Page } from '@playwright/test'
import { useEvent } from './event'
import { seedUser, signIn } from './seed'

test.describe.serial('Secteurs et responsables', () => {
	const event = useEvent('Secteurs')
	let page: Page

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
	})
	test.afterAll(async () => {
		await page.close()
	})

	test('Préparation: un évènement', async () => {
		await signIn(page, await seedUser('Barney'))
		await event.create(page)
	})

	// Crée « Alpha » et « Bravo », que les étapes suivantes lisent.
	test("Le formulaire de secteur repart de l'enregistrement ouvert", async () => {
		await event.expectTeamFormStateIsPerTeam(page)
	})

	test('Un responsable invité depuis le secteur ouvre la barre de sauvegarde', async () => {
		await event.expectTeamLeaderInvitedFromField(page)
	})

	test("L'invitation confie des secteurs dès la création du membre", async () => {
		await event.expectInviteAssignsTeams(page)
	})

	// En dernier: le membre créé ici est administrateur, et un membre ne porte que son rôle le
	// plus haut. Les badges de rôle des étapes précédentes ne s'attendent pas à le croiser.
	test("L'invitation nomme un administrateur dès la création du membre", async () => {
		await event.expectInviteNamesAdmin(page)
	})
})
