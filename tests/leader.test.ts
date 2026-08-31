import { expect, test, type Page } from '@playwright/test'
import { useUser } from './user'
import { useEvent } from './event'

/**
 * Le journal était réservé aux administrateurs, alors que tout ce qu'il montre — coordonnées,
 * rôles, champs de profil — se lit déjà sur la fiche d'un membre, que les responsables ouvrent.
 * Rien d'autre ne couvre son ouverture: le reste du parcours se joue en propriétaire.
 */
test.describe.serial("Journal d'un responsable", () => {
	const boss = useUser('Boss')
	const lead = useUser('Lead')
	const event = useEvent(boss, 'Journalerie')
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

	test('Préparation: un évènement, un secteur, deux comptes', async () => {
		await boss.register(page)
		await event.create(page)
		await lead.register(leadPage)

		await page.goto(`/${event.eventId}/admin/teams`)
		const newTeam = page.locator('a[href*="form_team=%7B%7D"]').first()
		const drawer = page.getByRole('dialog', { name: 'Nouveau secteur' })
		// Le tiroir ne s'ouvre qu'une fois la page hydratée: rejouer le couple clic/vérification
		// l'attend sans avoir à le deviner.
		await expect(async () => {
			await newTeam.click()
			await expect(drawer).toBeVisible({ timeout: 1000 })
		}).toPass()
		const teamName = drawer.getByLabel('Nom du secteur')
		await expect(async () => {
			await teamName.fill('Alpha')
			await expect(teamName).toHaveValue('Alpha', { timeout: 1000 })
		}).toPass()
		await drawer.getByRole('button', { name: 'Valider', exact: true }).click()
		await expect(drawer).toBeHidden()
	})

	test("Le responsable rejoint l'évènement", async () => {
		await page.goto(`/${event.eventId}/admin/members?form_invite=1`)
		const invite = page.getByRole('dialog')
		await invite.getByLabel('Prénom').fill('Lead')
		// `exact`: « Prénom » contient « nom ».
		await invite.getByLabel('Nom', { exact: true }).fill('The Tester')
		await invite.getByLabel('Email (optionnel)', { exact: true }).fill(lead.email)

		const combobox = invite.getByRole('combobox', { name: 'Responsable des secteurs' })
		const option = invite.getByRole('option', { name: 'Alpha', exact: true })
		await expect(async () => {
			await combobox.click()
			await expect(option).toBeVisible({ timeout: 1000 })
		}).toPass()
		await option.click()
		await invite.getByRole('button', { name: 'Valider' }).click()
		await expect(invite).toBeHidden()

		// L'évènement est en brouillon: l'adresse du compte suffit à rattacher le membre invité,
		// sans jeton.
		await leadPage.goto(`/${event.eventId}/register`)
		const accept = leadPage.getByRole('button', { name: 'Oui je le veux !' })
		await expect(accept).toBeVisible()
		await accept.click()
		await expect(accept).toBeHidden()
	})

	test('Il lit le journal, dans le tableau de bord comme sur une fiche', async () => {
		await leadPage.goto(`/${event.eventId}/admin/dashboard`)
		const entries = leadPage.locator('#journal').getByRole('listitem')
		await expect(entries.filter({ hasText: "a créé l'évènement" })).toHaveCount(1)
		await expect(entries.filter({ hasText: 'a créé le secteur Alpha' })).toHaveCount(1)

		// Le fil de la fiche ne porte que le membre ouvert: la création de l'évènement en sort.
		await leadPage.goto(`/${event.eventId}/admin/members`)
		await leadPage
			.getByRole('link', { name: /Lead The Tester/ })
			.first()
			.click()
		const memberEntries = leadPage.locator('#journal').getByRole('listitem')
		await expect(memberEntries.filter({ hasText: "a accepté l'invitation" })).toHaveCount(1)
		await expect(memberEntries.filter({ hasText: "a créé l'évènement" })).toHaveCount(0)
	})
})
