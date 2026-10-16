import { expect, test, type Page } from '@playwright/test'
import { useEvent } from './event'
import { seedMember, seedTeam, seedUser, signIn } from './seed'
import { gotoHydrated } from './hydrated'

/**
 * L'entrée de l'import: on choisit une source, un autre évènement dont on est admin ou un
 * fichier CSV, et on arrive sur le mappage. Lire les membres d'un autre évènement reste
 * réservé aux admins.
 */
test.describe.serial('Import de membres', () => {
	const target = useEvent('Cible')
	const source = useEvent('Source')
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

	test('Préparation: deux évènements, un·e responsable dans la cible', async () => {
		await signIn(page, await seedUser('Boss'))
		await source.create(page)
		await target.create(page)

		const team = await seedTeam(target.eventId, 'Alpha')
		const lead = await seedUser('Lead')
		await seedMember(target.eventId, lead, { leaderOf: [team.id] })
		await signIn(leadPage, lead)
	})

	test("L'admin choisit un autre évènement comme source", async () => {
		await gotoHydrated(page, `/${target.eventId}/admin/members`)
		await page.getByRole('link', { name: 'Importer des membres' }).click()
		await page.waitForURL(`**/${target.eventId}/admin/members/import`)

		const events = page.locator('#source-event')
		await expect(events.getByRole('link', { name: target.eventName })).toHaveCount(0)
		await events.getByRole('link', { name: source.eventName }).click()

		await page.waitForURL(`**/admin/members/import/event/${source.eventId}`)
		await expect(
			page.getByRole('heading', { name: `Importer depuis « ${source.eventName} »` })
		).toBeVisible()
	})

	test("L'admin choisit un fichier CSV comme source", async () => {
		await gotoHydrated(page, `/${target.eventId}/admin/members/import`)
		await page.getByLabel('Fichier CSV').setInputFiles({
			name: 'membres.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from('prénom,nom,email\nAda,Lovelace,ada@example.com\n'),
		})

		await page.waitForURL(`**/${target.eventId}/admin/members/import/csv`)
		await expect(
			page.getByRole('heading', { name: 'Importer depuis « membres.csv »' })
		).toBeVisible()

		// Le fichier ne vit que dans le navigateur: un rechargement ramène au choix.
		await page.reload()
		await page.waitForURL(`**/${target.eventId}/admin/members/import`)
	})

	test("Un·e responsable n'y a pas accès", async () => {
		await gotoHydrated(leadPage, `/${target.eventId}/admin/members`)
		await expect(leadPage.getByRole('link', { name: 'Importer des membres' })).toHaveCount(0)

		const response = await leadPage.goto(`/${target.eventId}/admin/members/import`)
		expect(response?.status()).toBe(403)
	})
})
