import { expect, test } from '@playwright/test'
import { useEvent } from './event'
import { seedField, seedInvitedMember, seedMember, seedTeam, seedUser, signIn } from './seed'
import { awaitHydrated, gotoHydrated } from './hydrated'
import { sharedPage } from './sharedPage'

/**
 * L'entrée de l'import: on choisit une source, un autre évènement dont on est admin ou un
 * fichier CSV, et on arrive sur le mappage. Chaque colonne du fichier y reçoit un champ deviné,
 * et celles qui ne passent pas sont signalées. Lire les membres d'un autre évènement reste
 * réservé aux admins.
 */
test.describe.serial('Import de membres', () => {
	const target = useEvent('Cible')
	const source = useEvent('Source')
	const page = sharedPage()
	const leadPage = sharedPage()

	test('Préparation: deux évènements, un·e responsable dans la cible', async () => {
		await signIn(page, await seedUser('Boss'))
		await source.create(page)
		await target.create(page)

		// Même nom que dans la cible: la colonne se mappe d'office.
		const sourceSize = await seedField(source.eventId, {
			name: 'Taille',
			type: 'select',
			options: ['Small', 'Medium', 'Large'],
		})
		await seedInvitedMember(source.eventId, {
			firstName: 'Marie',
			lastName: 'Curie',
			email: 'marie@example.com',
			profileJson: { [sourceSize.id]: 'Medium' },
		})
		await seedInvitedMember(source.eventId, { firstName: 'Pierre', lastName: 'Curie' })
		await seedInvitedMember(source.eventId, {
			firstName: 'Grace',
			lastName: 'Hopper',
			email: 'grace@example.com',
		})

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

	test("L'admin importe une partie des membres d'un autre évènement", async () => {
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

		// Une ligne par membre, une colonne par coordonnée et par champ: la même page que le CSV.
		const selector = (header: string) => page.getByLabel(header, { exact: true })
		await expect(selector('E-mail')).toContainText('E-mail')
		await expect(selector('Taille')).toContainText('Taille')
		await expect(page.getByText('à vérifier')).toHaveCount(0)

		// La source vient du serveur: un rechargement la rend, décochée ou non.
		await page.reload()
		await awaitHydrated(page)
		// Triés par nom de famille: les Curie ouvrent la liste, Pierre en deuxième.
		await expect(page.getByLabel('Ligne 2, colonne « Prénom »')).toHaveValue('Pierre')
		await page.getByLabel('Importer la ligne 2').uncheck()
		await expect(page.getByText('1 ligne décochée')).toBeVisible()

		await page.getByRole('button', { name: /^Importer \d+ membres$/ }).click()
		await page.waitForURL(`**/${target.eventId}/admin/members/import/report`)
		await expect(page.getByRole('link', { name: 'Marie Curie' })).toBeVisible()
		await expect(page.getByRole('row').filter({ hasText: 'grace@example.com' })).toContainText(
			'Déjà membre: Grace Brewster'
		)
		await expect(page.getByText('Pierre Curie')).toHaveCount(0)

		// Le profil suit: la taille de Marie arrive sur le champ homonyme de la cible.
		await page.getByRole('link', { name: 'Marie Curie' }).click()
		await expect(page.getByRole('button', { name: 'Taille' })).toContainText('Medium')
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

		await page.waitForURL(`**/${target.eventId}/admin/members/import/text`)
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
		await expect(page.getByText('depuis membres.csv')).toHaveCount(2)
		await expect(page.getByText(`depuis ${source.eventName}`).first()).toBeVisible()
	})

	test("L'admin colle une sélection de tableur sans en-tête", async () => {
		await gotoHydrated(page, `/${target.eventId}/admin/members/import`)
		const paste = page.locator('#source-paste')
		await expect(paste.getByRole('button', { name: 'Continuer' })).toBeDisabled()
		await paste
			.getByLabel('Données collées')
			.fill(
				'Katherine\tJohnson\tkatherine@example.com\n' + 'Dorothy\tVaughan\tdorothy@example.com\n'
			)
		// La case d'`InputBoolean` est masquée derrière sa coche dessinée: on clique son libellé.
		const header = paste.getByLabel('La première ligne contient les en-têtes')
		await paste.getByText('La première ligne contient les en-têtes').click()
		await expect(header).not.toBeChecked()
		await paste.getByRole('button', { name: 'Continuer' }).click()

		await page.waitForURL(`**/${target.eventId}/admin/members/import/text`)
		await expect(
			page.getByRole('heading', { name: 'Importer depuis « Données collées »' })
		).toBeVisible()

		// Sans en-tête, les adresses se reconnaissent à leur forme; le nom reste à désigner.
		const selector = (header: string) => page.getByLabel(header, { exact: true })
		await expect(page.getByLabel('Ligne 1, colonne « Colonne 1 »')).toHaveValue('Katherine')
		await expect(selector('Colonne 3')).toContainText('E-mail')
		await selector('Colonne 1').click()
		await page.getByRole('option', { name: /^Prénom\s*Coordonnée$/ }).click()
		await selector('Colonne 2').click()
		await page.getByRole('option', { name: /^Nom de famille\s*Coordonnée$/ }).click()

		await page.getByRole('button', { name: 'Importer 2 membres' }).click()
		await page.waitForURL(`**/${target.eventId}/admin/members/import/report`)
		await expect(page.locator('dl > div').filter({ hasText: 'Importés' })).toContainText('2')
		await expect(page.getByRole('link', { name: 'Katherine Johnson' })).toBeVisible()
	})

	test("Un·e responsable n'y a pas accès", async () => {
		await gotoHydrated(leadPage, `/${target.eventId}/admin/members`)
		await expect(leadPage.getByRole('link', { name: 'Importer des membres' })).toHaveCount(0)

		const response = await leadPage.goto(`/${target.eventId}/admin/members/import`)
		expect(response?.status()).toBe(403)
	})
})
