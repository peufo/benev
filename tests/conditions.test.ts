import { expect, test, type Locator, type Page } from '@playwright/test'
import { useEvent } from './event'
import { seedField, seedUser, signIn } from './seed'
import { gotoHydrated } from './hydrated'

/**
 * La copie réactive des conditions est ce que le champ caché sérialise: seule la valeur qui y
 * apparaît prouve que la saisie l'a atteinte, et non le seul DOM.
 */
async function fillCondition(page: Page, input: Locator, value: string, serialized: RegExp) {
	const conditions = page.locator('input[name="conditions"]')
	await input.fill(value)
	await expect(conditions).toHaveValue(serialized)
}

/** Ouvre le menu des conditions et en choisit une. */
async function addCondition(page: Page, label: string) {
	await page.getByRole('button', { name: 'Ajouter une condition' }).click()
	await page.getByRole('button', { name: label }).click()
}

// Les conditions se soumettent par un input caché sérialisé depuis un `$state`: une écriture
// non réactive ne casse rien de visible, elle se contente de ne jamais atteindre le serveur.
// Seul un aller-retour complet le prouve.
test.describe.serial('Conditions de secteur', () => {
	const event = useEvent('Cond')
	let page: Page
	let editUrl: string

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
	})
	test.afterAll(async () => {
		await page.close()
	})

	test('Préparation: compte, évènement, champ de profil', async () => {
		await signIn(page, await seedUser('Cond'))
		await event.create(page)
		// Le tiroir de champ est couvert par le parcours: ici il n'est qu'un préalable.
		await seedField(event.eventId, { name: 'Ville', type: 'string' })

		// TODO: couvrir aussi une condition sur un champ à choix multiple (`InputCheckboxes`).
	})

	// Le tiroir ne propose plus les conditions: elles se règlent dans leur section, sur la page
	// du secteur. Le compteur passe par une remote query, et son échec est avalé par un
	// `console.error`: seule une valeur juste prouve qu'elle répond.
	test('Création du secteur, puis aperçu des membres retenus', async () => {
		await gotoHydrated(page, `/${event.eventId}/admin/teams?form_team=%7B%7D`)
		const drawer = page.getByRole('dialog', { name: 'Nouveau secteur' })
		await expect(drawer).toBeVisible()
		await expect(drawer.getByRole('button', { name: 'Ajouter une condition' })).toHaveCount(0)

		const drawerName = drawer.getByLabel('Nom du secteur')
		await drawerName.fill('Secteur Cond')
		await expect(drawerName).toHaveValue('Secteur Cond')
		await drawer.getByRole('button', { name: 'Valider', exact: true }).click()

		// La création referme le tiroir et ouvre le secteur, où la section des conditions attend.
		await expect(drawer).toBeHidden()
		await expect(page.locator('#team').getByLabel('Nom du secteur')).toHaveValue('Secteur Cond')
		editUrl = page.url()
		await expect(page.getByText('Visible pour tous les membres')).toBeVisible()

		await addCondition(page, 'Membre approuvé')
		await expect(page.getByText('Visible pour 1 membre')).toBeVisible()

		// Rien n'est enregistré: la barre remet la section dans l'état du secteur chargé, et le
		// test suivant repart d'un secteur sans condition.
		await page.getByRole('button', { name: 'Réinitialiser' }).click()
		await expect(page.getByText('Modification en cours !')).toBeHidden()
		await expect(page.getByText('Visible pour tous les membres')).toBeVisible()
	})

	test('Ajout de deux conditions', async () => {
		// Condition "Âge minimum"
		await addCondition(page, 'Âge minimum')
		await expect(page.getByLabel('Âge minimum')).toHaveValue('18')

		// Condition "Profil du membre" sur Ville = Lyon
		await addCondition(page, 'Profil du membre')
		await page.getByRole('button', { name: 'Sélectionner un champ' }).click()
		await page.getByRole('option', { name: 'Ville' }).click()
		await fillCondition(page, page.getByLabel('Valeur'), 'Lyon', /"expectedValue":"Lyon"/)

		// Le secteur s'édite en place: l'enregistrement passe par la barre de sauvegarde.
		await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
		await expect(page.getByText('Succès')).toBeVisible()
	})

	test('Réouverture: les valeurs enregistrées sont restituées', async () => {
		await gotoHydrated(page, `/${event.eventId}/admin/teams`)
		await page
			.getByRole('link', { name: /Secteur Cond/ })
			.first()
			.click()
		await expect(page.getByLabel('Nom du secteur')).toHaveValue('Secteur Cond')

		await expect(page.getByLabel('Âge minimum')).toHaveValue('18')
		await expect(page.getByLabel('Valeur')).toHaveValue('Lyon')
		// Rien n'a été touché: la barre de sauvegarde reste muette. Un champ caché qui ne
		// s'accorderait pas avec l'enregistrement chargé la ferait apparaître à l'arrivée.
		await expect(page.getByText('Modification en cours !')).toBeHidden()
		editUrl = page.url()
	})

	// LE cas de régression: modifier une condition déjà enregistrée. Avant correctif, les
	// écritures dans le tableau non-proxy passaient inaperçues et étaient perdues.
	test('Modification de conditions existantes', async () => {
		await fillCondition(page, page.getByLabel('Âge minimum'), '25', /"args":25/)
		await fillCondition(page, page.getByLabel('Valeur'), 'Paris', /"expectedValue":"Paris"/)

		await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
		// Le toast de succès, et non le secteur déjà listé, prouve que l'écriture est partie avant
		// qu'on aille la relire.
		await expect(page.getByText('Succès')).toBeVisible()

		// Rechargement complet: l'état du `form()` repart de zéro, les valeurs viennent du serveur.
		await gotoHydrated(page, editUrl)
		await expect(page.getByLabel('Âge minimum')).toHaveValue('25')
		await expect(page.getByLabel('Valeur')).toHaveValue('Paris')
	})
})
