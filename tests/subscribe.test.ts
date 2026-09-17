import { expect, test, type Page } from '@playwright/test'
import { useUser } from './user'
import { useEvent } from './event'

/**
 * Une inscription proposée par un·e responsable attend la réponse du membre, et une fiche sans
 * compte n'y fait pas exception: la personne invitée trouve le créneau à trancher en arrivant sur
 * son tableau de bord, et non déjà confirmé en son nom. Le parcours entier, de l'inscription par
 * l'organisation à la réponse du membre.
 */
test.describe.serial("Inscription d'une fiche invitée", () => {
	const boss = useUser('Boss')
	const guest = useUser('Guest')
	const event = useEvent(boss, 'Attente')
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

	test('Préparation: un évènement publié, un secteur, un créneau, une invitation', async () => {
		await boss.register(page)
		await event.create(page)

		// En brouillon, l'espace bénévole n'existe pas encore: la personne invitée n'y verrait
		// rien à trancher.
		await page.goto(`/${event.eventId}/admin/settings`)
		await page.getByRole('button', { name: 'Publier', exact: true }).click()
		await expect(page.getByText('Évènement publié').first()).toBeVisible()

		await page.goto(`/${event.eventId}/admin/teams`)
		const newTeam = page.locator('a[href*="form_team=%7B%7D"]').first()
		const teamDrawer = page.getByRole('dialog', { name: 'Nouveau secteur' })
		// Le tiroir ne s'ouvre qu'une fois la page hydratée: rejouer le couple clic/vérification
		// l'attend sans avoir à le deviner.
		await expect(async () => {
			await newTeam.click()
			await expect(teamDrawer).toBeVisible({ timeout: 1000 })
		}).toPass()
		const teamName = teamDrawer.getByLabel('Nom du secteur')
		await expect(async () => {
			await teamName.fill('Alpha')
			await expect(teamName).toHaveValue('Alpha', { timeout: 1000 })
		}).toPass()
		await teamDrawer.getByRole('button', { name: 'Valider', exact: true }).click()
		await expect(teamDrawer).toBeHidden()

		// Depuis la page du secteur, le tiroir de créneau arrive avec le secteur choisi et des
		// horaires par défaut, à venir: rien d'autre à remplir.
		await page.getByRole('link', { name: 'Alpha' }).click()
		const newPeriod = page.locator('a[href*="form_period"]').first()
		const periodDrawer = page.getByRole('dialog', { name: "Création d'un créneau" })
		await expect(async () => {
			await newPeriod.click()
			await expect(periodDrawer).toBeVisible({ timeout: 1000 })
		}).toPass()
		await periodDrawer.getByRole('button', { name: 'Ajouter' }).click()
		await expect(periodDrawer).toBeHidden()

		await page.goto(`/${event.eventId}/admin/members?form_invite=1`)
		const invite = page.getByRole('dialog')
		await invite.getByLabel('Prénom').fill('Glados')
		// `exact`: « Prénom » contient « nom ».
		await invite.getByLabel('Nom', { exact: true }).fill('Aperture')
		await invite.getByLabel('Email (optionnel)', { exact: true }).fill(guest.email)
		await invite.getByRole('button', { name: 'Valider' }).click()
		await expect(invite).toBeHidden()
	})

	test("L'organisation inscrit la fiche: la demande attend le membre", async () => {
		await page.goto(`/${event.eventId}/admin/members`)
		await page
			.getByRole('link', { name: /Glados Aperture/ })
			.first()
			.click()

		const subscribes = page.locator('#subscibes')
		await subscribes.getByRole('button').first().click()
		// Le dialogue ne porte pas de nom accessible: c'est son titre qui le désigne.
		const dialog = page
			.getByRole('dialog')
			.filter({ has: page.getByRole('heading', { name: 'Nouvelle inscription pour Glados' }) })
		await expect(dialog).toBeVisible()
		await dialog.getByRole('menuitem', { name: /Alpha/ }).click()
		await dialog.getByRole('menuitem').first().click()
		await expect(page.getByText('Inscription créée')).toBeVisible()
		await expect(dialog).toBeHidden()

		// Après le bouton d'ajout de la section vient la ligne du créneau, dont le premier bouton
		// porte l'état et l'explique en infobulle.
		await subscribes.getByRole('button').nth(1).hover()
		await expect(page.getByRole('tooltip')).toHaveText(
			"En attente de validation du membre, qui n'a pas encore lié de compte"
		)
	})

	test('Le membre lie son compte et répond lui-même', async () => {
		await guest.register(guestPage)
		await guest.verifyEmail()
		await guestPage.goto(`/${event.eventId}/register`)
		const accept = guestPage.getByRole('button', { name: 'Oui je le veux !' })
		await expect(accept).toBeVisible()
		await accept.click()
		await expect(accept).toBeHidden()

		// Le secteur est né en brouillon: la demande préparée n'existe pas encore pour le membre.
		await guestPage.goto(`/${event.eventId}/me`)
		const toConfirm = guestPage.getByRole('button', { name: 'à confirmer' })
		await expect(guestPage.getByRole('heading', { name: 'Mes inscriptions' })).toBeVisible()
		await expect(toConfirm).toHaveCount(0)

		// Valider le secteur libère la demande, et le créneau apparaît au membre. C'est sans
		// retour: la confirmation annonce le courriel qui part.
		await page.goto(`/${event.eventId}/admin/teams`)
		await page.getByRole('link', { name: 'Alpha' }).click()
		await page.getByRole('button', { name: 'Brouillon', exact: true }).click()
		page.once('dialog', (confirmation) => {
			expect(confirmation.message()).toContain("1 demande d'inscription partira")
			void confirmation.accept()
		})
		await page.getByRole('button', { name: 'Valider', exact: true }).click()
		await expect(page.getByText('Validé', { exact: true }).first()).toBeVisible()

		await guestPage.reload()
		await expect(toConfirm).toBeVisible()
		await toConfirm.click()
		await guestPage.getByRole('button', { name: 'Confirmer', exact: true }).click()
		await expect(guestPage.getByText('Status changé')).toBeVisible()
		await expect(toConfirm).toHaveCount(0)

		// Le dernier bouton de la section est celui de l'état: un membre n'a pas de menu après lui.
		await guestPage.locator('#subscribes').getByRole('button').last().hover()
		await expect(guestPage.getByRole('tooltip')).toHaveText('Inscription confirmée par le membre')
	})

	/** La ligne du seul créneau du secteur, qui ouvre son tiroir d'édition. */
	async function openPeriodDrawer() {
		await page.goto(`/${event.eventId}/admin/teams`)
		await page.getByRole('link', { name: 'Alpha' }).click()
		const row = page.locator('[role="button"].menu-item').first()
		const drawer = page.getByRole('dialog', { name: "Édition d'un créneau" })
		await expect(async () => {
			await row.click()
			await expect(drawer).toBeVisible({ timeout: 1000 })
		}).toPass()
		return drawer
	}

	test("Changer l'horaire d'un créneau validé prévient ses inscrit·es", async () => {
		const drawer = await openPeriodDrawer()
		// Le libellé « Début » vise le champ de l'heure; l'heure du jour, posée par défaut à la
		// création, est inconnue: on vise celle qu'elle n'est pas.
		const start = drawer.getByLabel('Début')
		const current = await start.inputValue()
		await start.fill(current === '10:00' ? '11:00' : '10:00')

		// Sans écouteur, Playwright refuse le `confirm()` et rien ne part.
		page.once('dialog', (confirmation) => {
			expect(confirmation.message()).toContain('1 inscrit·e recevra un courriel')
			void confirmation.accept()
		})
		await drawer.getByRole('button', { name: 'Valider', exact: true }).click()
		await expect(page.getByText('Créneau mis à jour')).toBeVisible()
		await expect(drawer).toBeHidden()

		await page.goto(`/${event.eventId}/admin/dashboard`)
		const entries = page.locator('#journal').getByRole('listitem')
		const moved = entries.filter({ hasText: 'a modifié un créneau de Alpha' })
		await expect(moved).toHaveCount(1)
		await expect(moved).toContainText('Début')
		await expect(moved).toContainText('1 inscrit·e prévenu·e')
	})

	test('Supprimer un créneau validé prévient et journalise chaque inscription', async () => {
		const drawer = await openPeriodDrawer()
		page.once('dialog', (confirmation) => {
			expect(confirmation.message()).toContain('annonçant sa suppression')
			void confirmation.accept()
		})
		await drawer.getByRole('button', { name: 'Supprimer' }).click()
		await drawer.getByRole('button', { name: "T'es sur ?" }).click()
		await expect(page.getByText('Créneau supprimé')).toBeVisible()
		await expect(drawer).toBeHidden()

		// Le compte lié a recopié son nom sur la fiche: Glados Aperture est devenue Guest The Tester.
		await page.goto(`/${event.eventId}/admin/dashboard`)
		const entries = page.locator('#journal').getByRole('listitem')
		await expect(entries.filter({ hasText: 'a retiré un créneau de Alpha' })).toHaveCount(1)
		await expect(
			entries.filter({ hasText: "a supprimé l'inscription de Guest The Tester à Alpha" })
		).toHaveCount(1)

		// La ligne de l'inscription appartient au membre: elle se lit aussi sur sa page.
		await page.goto(`/${event.eventId}/admin/members`)
		await page
			.getByRole('link', { name: /Guest The Tester/ })
			.first()
			.click()
		await expect(
			page.locator('#journal').getByRole('listitem').filter({ hasText: "a supprimé l'inscription" })
		).toHaveCount(1)
	})
})
