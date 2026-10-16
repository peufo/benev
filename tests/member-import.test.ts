import { expect, test, type Page } from '@playwright/test'
import { useEvent } from './event'
import { seedField, seedInvitedMember, seedMember, seedTeam, seedUser, signIn } from './seed'
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

		await seedField(target.eventId, {
			name: 'Taille',
			type: 'select',
			options: ['Small', 'Medium', 'Large'],
		})

		// Grace est déjà membre de la cible: l'import doit l'écarter, pas la dupliquer.
		await seedInvitedMember(target.eventId, {
			firstName: 'Grace',
			lastName: 'Brewster',
			email: 'grace@example.com',
		})

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

	test("L'admin choisit un fichier CSV, corrige son mappage et l'importe", async () => {
		await gotoHydrated(page, `/${target.eventId}/admin/members/import`)
		await page.getByLabel('Fichier CSV').setInputFiles({
			name: 'membres.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(
				'Prénom;Nom;Courriel;Taille;Régime\n' +
					'Ada;Lovelace;ada@example.com;M;vegan\n' +
					'Alan;Turing;alan@;Large;vegan\n' +
					'Grace;Hopper;grace@example.com;M;omni\n'
			),
		})

		await page.waitForURL(`**/${target.eventId}/admin/members/import/csv`)
		await expect(
			page.getByRole('heading', { name: 'Importer depuis « membres.csv »' })
		).toBeVisible()

		// Le sélecteur d'une colonne porte son en-tête pour libellé.
		const selector = (header: string) => page.getByLabel(header, { exact: true })
		const column = (header: string) => page.locator('th').filter({ has: selector(header) })
		const cell = (line: number, header: string) =>
			page.getByLabel(`Ligne ${line}, colonne « ${header} »`)

		await expect(selector('Prénom')).toContainText('Prénom')
		await expect(selector('Nom')).toContainText('Nom de famille')
		await expect(selector('Courriel')).toContainText('E-mail')
		await expect(selector('Taille')).toContainText('Taille')
		await expect(column('Courriel')).toContainText('1 valeur invalide')
		await expect(column('Taille')).toContainText('2 valeurs invalides')
		await expect(column('Régime')).toContainText('Aucun champ trouvé')
		await expect(page.getByText('3 colonnes à vérifier')).toBeVisible()

		// `M` est reconnu comme l'abréviation de `Medium`, `Large` est déjà une option.
		await column('Taille').getByRole('button', { name: 'Correspondance' }).click()
		const dialog = page.getByRole('dialog')
		const rowM = dialog.getByRole('listitem').filter({ hasText: '× 2' })
		await expect(rowM.getByRole('button').first()).toHaveText('Medium')
		await dialog.getByRole('button', { name: 'Appliquer' }).click()
		await expect(cell(2, 'Taille')).toHaveValue('Medium')
		await expect(column('Taille')).not.toContainText('invalide')

		// Une valeur se corrige dans sa cellule.
		await cell(3, 'Courriel').fill('alan@example.com')
		await cell(3, 'Courriel').press('Tab')
		await expect(column('Courriel')).not.toContainText('invalide')

		// Le champ manquant se crée depuis la colonne, prérempli d'après elle.
		await selector('Régime').click()
		await page.getByRole('link', { name: 'Créer un champ' }).click()
		await expect(page.getByRole('textbox', { name: 'Nom', exact: true })).toHaveValue('Régime')
		await page.getByRole('button', { name: 'Valider' }).click()
		await expect(selector('Régime')).toContainText('Régime')
		await expect(column('Régime')).not.toContainText('Aucun champ trouvé')
		await expect(page.getByText('à vérifier')).toHaveCount(0)

		// L'import part, et son rapport dit ce qui est entré et ce qui a été écarté.
		await expect(page.getByLabel('Envoyer une invitation par e-mail')).not.toBeChecked()
		await page.getByRole('button', { name: 'Importer 3 membres' }).click()
		await page.waitForURL(`**/${target.eventId}/admin/members/import/report`)
		await expect(page.getByRole('heading', { name: "Rapport d'import" })).toBeVisible()
		const stat = (label: string) => page.locator('dl > div').filter({ hasText: label })
		await expect(stat('Importés')).toContainText('2')
		await expect(stat('Écartés')).toContainText('1')
		await expect(stat('Échecs')).toContainText('0')
		const grace = page.getByRole('row').filter({ hasText: 'grace@example.com' })
		await expect(grace).toContainText('Déjà membre: Grace Brewster')
		await expect(page.getByRole('link', { name: 'Ada Lovelace' })).toBeVisible()

		// Le fichier est oublié: revenir en arrière ramène au choix de la source.
		await page.goBack()
		await page.waitForURL(`**/${target.eventId}/admin/members/import`)

		// Le rapport ne survit pas à un rechargement; le journal, lui, garde une ligne par membre.
		await gotoHydrated(page, `/${target.eventId}/admin/members/import/report`)
		await page.waitForURL(`**/${target.eventId}/admin/members`)
		await gotoHydrated(page, `/${target.eventId}/admin/dashboard`)
		await expect(page.getByText('a importé')).toHaveCount(2)
		await expect(page.getByText('depuis membres.csv').first()).toBeVisible()
	})

	test("Un·e responsable n'y a pas accès", async () => {
		await gotoHydrated(leadPage, `/${target.eventId}/admin/members`)
		await expect(leadPage.getByRole('link', { name: 'Importer des membres' })).toHaveCount(0)

		const response = await leadPage.goto(`/${target.eventId}/admin/members/import`)
		expect(response?.status()).toBe(403)
	})
})
