import { expect, test, type Page } from '@playwright/test'
import { useEvent } from './event'
import { seedInvitedMember, seedPeriod, seedTeam, seedUser, signIn } from './seed'
import { awaitHydrated, gotoHydrated } from './hydrated'

/**
 * Une inscription proposée par un·e responsable attend la réponse du membre, et une fiche sans
 * compte n'y fait pas exception: la personne invitée trouve le créneau à trancher en arrivant sur
 * son tableau de bord, et non déjà confirmé en son nom. Le parcours entier, de l'inscription par
 * l'organisation à la réponse du membre.
 */
test.describe.serial("Inscription d'une fiche invitée", () => {
	const event = useEvent('Attente')
	/** Le compte de la personne invitée, semé à la préparation. */
	let guest: Awaited<ReturnType<typeof seedUser>>
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
		await signIn(page, await seedUser('Boss'))
		await event.create(page)

		// En brouillon, l'espace bénévole n'existe pas encore: la personne invitée n'y verrait
		// rien à trancher.
		await gotoHydrated(page, `/${event.eventId}/admin/settings`)
		await page.getByRole('button', { name: 'Publier', exact: true }).click()
		await expect(page.getByText('Évènement publié').first()).toBeVisible()

		// Le secteur naît en brouillon, comme par le tiroir: c'est ce statut que la suite éprouve.
		const team = await seedTeam(event.eventId, 'Alpha')
		await seedPeriod(team.id)

		guest = await seedUser('Guest')
		await seedInvitedMember(event.eventId, {
			firstName: 'Glados',
			lastName: 'Aperture',
			email: guest.email,
		})
	})

	test("L'organisation inscrit la fiche: la demande attend le membre", async () => {
		await gotoHydrated(page, `/${event.eventId}/admin/members`)
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
		await signIn(guestPage, guest)
		await gotoHydrated(guestPage, `/${event.eventId}/register`)
		const accept = guestPage.getByRole('button', { name: 'Oui je le veux !' })
		await expect(accept).toBeVisible()
		await accept.click()
		await expect(accept).toBeHidden()

		// Le secteur est né en brouillon: il ne se montre pas au membre, et la demande préparée
		// n'existe pas encore pour lui.
		await gotoHydrated(guestPage, `/${event.eventId}/teams`)
		await expect(guestPage.getByText('Pas de secteur')).toBeVisible()
		await expect(guestPage.getByText('Alpha')).toHaveCount(0)

		await gotoHydrated(guestPage, `/${event.eventId}/me`)
		const toConfirm = guestPage.getByRole('button', { name: 'à confirmer' })
		await expect(guestPage.getByRole('heading', { name: 'Mes inscriptions' })).toBeVisible()
		await expect(toConfirm).toHaveCount(0)

		// Valider le secteur libère la demande, et le créneau apparaît au membre. C'est sans
		// retour: la confirmation annonce le courriel qui part et le brouillon qu'on quitte.
		await gotoHydrated(page, `/${event.eventId}/admin/teams`)
		await page.getByRole('link', { name: 'Alpha' }).click()
		await page.getByRole('button', { name: 'Brouillon', exact: true }).click()
		await page.getByRole('button', { name: 'Valider', exact: true }).click()
		const confirmation = page.getByRole('dialog')
		await expect(confirmation).toContainText("1 demande d'inscription partira")
		await expect(confirmation).toContainText('ne peut pas être repassé en brouillon')
		await confirmation.getByRole('button', { name: 'Confirmer' }).click()
		await expect(page.getByText('Validé', { exact: true }).first()).toBeVisible()

		// Et le retour en arrière n'est plus proposé nulle part dans le menu d'état.
		await page.getByRole('button', { name: 'Validé', exact: true }).click()
		await expect(page.getByRole('button', { name: /brouillon/i })).toHaveCount(0)
		await page.keyboard.press('Escape')

		await gotoHydrated(page, `/${event.eventId}/admin/dashboard`)
		await expect(
			page
				.locator('#journal')
				.getByRole('listitem')
				.filter({ hasText: 'a changé le statut du secteur Alpha' })
		).toHaveCount(1)

		await guestPage.reload()
		await awaitHydrated(guestPage)
		await expect(toConfirm).toBeVisible()
		await toConfirm.click()
		await guestPage.getByRole('button', { name: 'Confirmer', exact: true }).click()
		await expect(guestPage.getByText('Status changé')).toBeVisible()
		await expect(toConfirm).toHaveCount(0)

		// Le dernier bouton de la carte du secteur est celui de l'état: un membre n'a pas de menu
		// après lui. La section, elle, en porte d'autres dans son pied.
		const teamCard = guestPage.getByRole('heading', { name: 'Alpha' }).locator('..')
		await teamCard.getByRole('button').last().hover()
		await expect(guestPage.getByRole('tooltip')).toHaveText('Inscription confirmée par le membre')
	})

	/** La ligne du seul créneau du secteur, qui ouvre son tiroir d'édition. */
	async function openPeriodDrawer() {
		await gotoHydrated(page, `/${event.eventId}/admin/teams`)
		await page.getByRole('link', { name: 'Alpha' }).click()
		const row = page.locator('[role="button"].menu-item').first()
		const drawer = page.getByRole('dialog', { name: "Édition d'un créneau" })
		await row.click()
		await expect(drawer).toBeVisible()
		return drawer
	}

	test("Changer l'horaire d'un créneau validé prévient ses inscrit·es", async () => {
		const drawer = await openPeriodDrawer()
		// Le libellé « Début » vise le champ de l'heure; l'heure du jour, posée par défaut à la
		// création, est inconnue: on vise celle qu'elle n'est pas.
		const start = drawer.getByLabel('Début')
		const current = await start.inputValue()
		await start.fill(current === '10:00' ? '11:00' : '10:00')

		// Le dialogue de fuma est monté dans `body`, hors du tiroir, et n'a pas de nom accessible.
		await drawer.getByRole('button', { name: 'Valider', exact: true }).click()
		const choice = page.getByRole('dialog').filter({ hasText: 'déjà reçu cet horaire' })
		await expect(choice).toContainText('1 inscrit·e a déjà reçu')
		await choice.getByRole('button', { name: 'Valider et notifier' }).click()
		await expect(page.getByText('Créneau mis à jour')).toBeVisible()
		await expect(drawer).toBeHidden()

		await gotoHydrated(page, `/${event.eventId}/admin/dashboard`)
		const entries = page.locator('#journal').getByRole('listitem')
		const moved = entries.filter({ hasText: 'a modifié un créneau de Alpha' })
		await expect(moved).toHaveCount(1)
		await expect(moved).toContainText('Début')
		await expect(moved).toContainText('1 inscrit·e prévenu·e')
	})

	test("Retoucher l'horaire sans prévenir se journalise sans courriel", async () => {
		const drawer = await openPeriodDrawer()
		const start = drawer.getByLabel('Début')
		const current = await start.inputValue()
		await start.fill(current === '10:00' ? '11:00' : '10:00')

		await drawer.getByRole('button', { name: 'Valider', exact: true }).click()
		const choice = page.getByRole('dialog').filter({ hasText: 'déjà reçu cet horaire' })
		await choice.getByRole('button', { name: 'Valider', exact: true }).click()
		await expect(page.getByText('Créneau mis à jour')).toBeVisible()
		await expect(drawer).toBeHidden()

		await gotoHydrated(page, `/${event.eventId}/admin/dashboard`)
		const entries = page.locator('#journal').getByRole('listitem')
		const silent = entries
			.filter({ hasText: 'a modifié un créneau de Alpha' })
			.filter({ hasText: 'aucun courriel' })
		await expect(silent).toHaveCount(1)
	})

	test('Supprimer un créneau validé prévient et journalise chaque inscription', async () => {
		const drawer = await openPeriodDrawer()
		await drawer.getByRole('button', { name: 'Supprimer' }).click()
		await drawer.getByRole('button', { name: "T'es sur ?" }).click()
		await page
			.getByRole('dialog')
			.filter({ hasText: 'annonçant sa suppression' })
			.getByRole('button', { name: 'Supprimer' })
			.click()
		await expect(page.getByText('Créneau supprimé')).toBeVisible()
		await expect(drawer).toBeHidden()

		// Le compte lié a recopié son nom sur la fiche: Glados Aperture est devenue Guest The Tester.
		await gotoHydrated(page, `/${event.eventId}/admin/dashboard`)
		const entries = page.locator('#journal').getByRole('listitem')
		await expect(entries.filter({ hasText: 'a retiré un créneau de Alpha' })).toHaveCount(1)
		await expect(
			entries.filter({ hasText: "a supprimé l'inscription de Guest The Tester à Alpha" })
		).toHaveCount(1)

		// La ligne de l'inscription appartient au membre: elle se lit aussi sur sa page.
		await gotoHydrated(page, `/${event.eventId}/admin/members`)
		await page
			.getByRole('link', { name: /Guest The Tester/ })
			.first()
			.click()
		await expect(
			page.locator('#journal').getByRole('listitem').filter({ hasText: "a supprimé l'inscription" })
		).toHaveCount(1)
	})
})
