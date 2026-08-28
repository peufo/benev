import { expect, test, type Page } from '@playwright/test'
import { useUser } from './user'
import { useEvent } from './event'

test('Page vitrine', async ({ page }) => {
	await page.goto('/')
	await expect(page).toHaveTitle(/benevio/i)
	await expect(page.getByRole('heading', { name: /s'inscrivent tout seuls/i })).toBeVisible()
})

// serial + page partagée: la session doit survivre d'une étape à l'autre
test.describe.serial("Parcours d'un organisateur", () => {
	const bob = useUser('Bob')
	const event = useEvent(bob, 'Aperture')
	let page: Page

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
	})
	test.afterAll(async () => {
		await page.close()
	})

	test("Création d'un compte", async () => {
		await bob.register(page)
		await bob.expectConnected(page)
	})

	// contexte neuf: connecté, /auth redirige et le formulaire n'existe plus
	test('Reconnexion depuis une session vierge', async ({ page: freshPage }) => {
		await bob.login(freshPage)
		await bob.expectConnected(freshPage)
	})

	test('Une soumission refusée ne vide aucun champ', async () => {
		await event.expectInvalidSubmitKeepsFields(page)
	})

	test("Création d'un évènement avec un lieu", async () => {
		await event.create(page)
	})

	test("Navigation sur l'évènement", async () => {
		await event.setLocation(page)
		await event.gotoPublic(page)
		await event.expectLocationInFooter(page)
	})

	test('Filtres des tables admin', async () => {
		await event.expectAdminFiltersAccepted(page)
	})

	test('Les anciennes pages de réglages redirigent vers /admin/settings', async () => {
		await event.expectSettingsRedirects(page)
	})

	test('La barre de sauvegarde des réglages suit les modifications', async () => {
		await event.expectSettingsSaveBar(page)
	})

	test("Le thème posé à la création se change, s'enregistre et se retire", async () => {
		await event.expectThemePresets(page)
	})

	test("L'édition d'une page s'enregistre par la barre de sauvegarde", async () => {
		await event.expectPageEditorSaveBar(page)
	})

	test('Le formulaire de champ de profil suit le type et les droits', async () => {
		await event.expectMemberFieldForm(page)
	})

	test('La médiathèque est un tiroir unique', async () => {
		await event.expectMediaDrawer(page)
	})

	test("L'invitation reconnaît un compte existant", async () => {
		await event.expectInviteFindsExistingUser(page, bob.email)
	})

	test("L'invitation refuse une adresse déjà membre", async () => {
		await event.expectInviteRejectsDuplicateEmail(page, bob.email)
	})

	test("Le profil du membre s'édite sur sa fiche, par la barre de sauvegarde", async () => {
		await event.expectMemberProfileSaveBar(page)
	})

	// Avant le journal: les deux secteurs créés ici lui ajoutent deux entrées, et sa fenêtre par
	// défaut en tient trente.
	test("Le formulaire de secteur repart de l'enregistrement ouvert", async () => {
		await event.expectTeamFormStateIsPerTeam(page)
	})

	test('Le journal rend ce que le parcours a écrit, et accepte une note', async () => {
		await event.expectJournal(page)
	})

	test('Le journal charge les entrées précédentes vers le haut', async () => {
		await event.expectJournalLoadsPrevious(page)
	})

	// Après le journal: les deux entrées écrites ici déborderaient la fenêtre de trente que
	// `expectJournal` suppose complète.
	test("L'invitation se renvoie depuis la fiche du membre", async () => {
		await event.expectResendInvite(page)
	})

	// Après les secteurs, qui n'existent qu'à partir de là, et après le journal, dont la fenêtre
	// de trente entrées déborderait de ce que ce parcours y ajoute.
	test("L'invitation confie des secteurs dès la création du membre", async () => {
		await event.expectInviteAssignsTeams(page)
	})

	test('Un responsable invité depuis le secteur ouvre la barre de sauvegarde', async () => {
		await event.expectTeamLeaderInvitedFromField(page)
	})
})
