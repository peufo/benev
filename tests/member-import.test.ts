import { expect, test, type Page } from '@playwright/test'
import { useEvent } from './event'
import { seedField, seedMember, seedTeam, seedUser, signIn } from './seed'
import { gotoHydrated } from './hydrated'

/**
 * L'entrée de l'import: on choisit une source, un autre évènement dont on est admin ou un
 * fichier CSV, et on arrive sur le mappage. Chaque colonne du fichier y reçoit un champ deviné,
 * et celles qui ne passent pas sont signalées. Lire les membres d'un autre évènement reste
 * réservé aux admins.
 */
test.describe.serial('Import de membres', () => {
	const target = useEvent('Cible')
	const source = useEvent('Source')
	let page: Page
	let leadPage: Page
	let sizeFieldId: string

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

		const size = await seedField(target.eventId, {
			name: 'Taille',
			type: 'select',
			options: ['S', 'M', 'L'],
		})
		sizeFieldId = size.id

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

	test("L'admin choisit un fichier CSV et corrige son mappage", async () => {
		await gotoHydrated(page, `/${target.eventId}/admin/members/import`)
		await page.getByLabel('Fichier CSV').setInputFiles({
			name: 'membres.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(
				'Prénom;Nom;Courriel;Taille;Inconnue\n' +
					'Ada;Lovelace;ada@example.com;M;x\n' +
					'Alan;Turing;alan@example.com;XXL;y\n'
			),
		})

		await page.waitForURL(`**/${target.eventId}/admin/members/import/csv`)
		await expect(
			page.getByRole('heading', { name: 'Importer depuis « membres.csv »' })
		).toBeVisible()

		const select = (header: string) => page.getByLabel(`Champ pour la colonne « ${header} »`)
		await expect(select('Prénom')).toHaveValue('contact:firstName')
		await expect(select('Nom')).toHaveValue('contact:lastName')
		await expect(select('Courriel')).toHaveValue('contact:email')
		await expect(select('Taille')).toHaveValue(`field:${sizeFieldId}`)
		await expect(page.getByText('1 valeur invalide')).toBeVisible()
		await expect(page.getByText('Aucun champ trouvé')).toBeVisible()
		await expect(page.getByText('2 colonnes à vérifier')).toBeVisible()

		await select('Inconnue').selectOption('ignore')
		await expect(page.getByText('Aucun champ trouvé')).toHaveCount(0)
		await expect(page.getByText('1 colonne à vérifier')).toBeVisible()

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
