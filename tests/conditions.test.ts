import { expect, test, type Locator, type Page } from '@playwright/test'
import { useUser } from './user'
import { useEvent } from './event'

/**
 * Tant que la page n'est pas hydratée, la saisie ne fait qu'écrire dans le DOM: la copie
 * réactive des conditions l'ignore, et c'est elle que le champ caché sérialise. Attendre que
 * la valeur y apparaisse est donc à la fois l'attente de l'hydratation et l'assertion utile.
 */
async function fillCondition(page: Page, input: Locator, value: string, serialized: RegExp) {
	const conditions = page.locator('input[name="conditions"]')
	await expect(async () => {
		await input.fill(value)
		await expect(conditions).toHaveValue(serialized, { timeout: 1000 })
	}).toPass()
}

/**
 * Le menu ne s'ouvre qu'une fois la page hydratée. Rejouer le couple ouverture/choix l'attend
 * sans avoir à le deviner: tant que le choix échoue, aucune condition n'a été ajoutée, et
 * rouvrir un menu déjà ouvert ne coûte rien.
 */
async function addCondition(page: Page, label: string) {
	await expect(async () => {
		await page.getByRole('button', { name: 'Ajouter une condition' }).click()
		await page.getByRole('button', { name: label }).click({ timeout: 1000 })
	}).toPass()
}

// Les conditions se soumettent par un input caché sérialisé depuis un `$state`: une écriture
// non réactive ne casse rien de visible, elle se contente de ne jamais atteindre le serveur.
// Seul un aller-retour complet le prouve.
test.describe.serial('Conditions de secteur', () => {
	const bob = useUser('Cond')
	const event = useEvent(bob, 'Cond')
	let page: Page
	let editUrl: string

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
	})
	test.afterAll(async () => {
		await page.close()
	})

	test('Préparation: compte, évènement, champ de profil', async () => {
		await bob.register(page)
		await event.create(page)

		// Le popover d'`InputSelect` ne réagit qu'une fois la page hydratée: rejouer le couple
		// clic/vérification attend l'hydratation sans avoir à la deviner.
		const selectFieldType = async (label: string) => {
			const trigger = page.getByRole('button', { name: 'Type de champ' })
			await expect(async () => {
				if (!(await trigger.textContent())?.includes(label)) {
					await trigger.click()
					await page.getByRole('option', { name: label, exact: true }).click({ timeout: 1000 })
				}
				await expect(trigger).toContainText(label, { timeout: 1000 })
			}).toPass()
		}

		// Champ de profil "Ville" (type Text)
		await page.goto(`/${event.eventId}/admin/members?form_field=%7B%7D`)
		await selectFieldType('Text')
		await page.getByLabel('Nom', { exact: true }).fill('Ville')
		await page.getByRole('button', { name: 'Valider', exact: true }).last().click()
		await expect(page.getByRole('dialog', { name: 'Nouveau champ' })).toBeHidden()

		// TODO: couvrir aussi une condition sur un champ à choix multiple (`InputCheckboxes`).
	})

	// Le tiroir ne propose plus les conditions: elles se règlent dans leur section, sur la page
	// du secteur. Le compteur passe par une remote query, et son échec est avalé par un
	// `console.error`: seule une valeur juste prouve qu'elle répond.
	test('Création du secteur, puis aperçu des membres retenus', async () => {
		await page.goto(`/${event.eventId}/admin/teams?form_team=%7B%7D`)
		const drawer = page.getByRole('dialog', { name: 'Nouveau secteur' })
		await expect(drawer).toBeVisible()
		await expect(drawer.getByRole('button', { name: 'Ajouter une condition' })).toHaveCount(0)

		// Saisi avant l'hydratation, le nom serait écrasé par le rendu client, qui repose la
		// valeur initiale du champ.
		const drawerName = drawer.getByLabel('Nom du secteur')
		await expect(async () => {
			await drawerName.fill('Secteur Cond')
			await expect(drawerName).toHaveValue('Secteur Cond', { timeout: 1000 })
		}).toPass()
		await drawer.getByRole('button', { name: 'Valider', exact: true }).click()

		// La création referme le tiroir et ouvre le secteur, où la section des conditions attend.
		await expect(drawer).toBeHidden()
		await expect(page.locator('#team').getByLabel('Nom du secteur')).toHaveValue('Secteur Cond')
		editUrl = page.url()
		await expect(page.getByText('Aucune condition')).toBeVisible()
		await expect(page.getByText('Visible pour tous les membres')).toBeVisible()

		await addCondition(page, 'Membre approuvé')
		await expect(page.getByText('Visible pour 1 membre')).toBeVisible()

		// Rien n'est enregistré: la barre remet la section dans l'état du secteur chargé, et le
		// test suivant repart d'un secteur sans condition.
		await page.getByRole('button', { name: 'Réinitialiser' }).click()
		await expect(page.getByText('Modification en cours !')).toBeHidden()
		await expect(page.getByText('Aucune condition')).toBeVisible()
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
		await page.goto(`/${event.eventId}/admin/teams`)
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
		await page.goto(editUrl)
		await expect(page.getByLabel('Âge minimum')).toHaveValue('25')
		await expect(page.getByLabel('Valeur')).toHaveValue('Paris')
	})
})
