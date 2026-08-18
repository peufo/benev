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

	// Le compteur passe par une remote query, et son échec est avalé par un `console.error`:
	// seule une valeur juste prouve qu'elle répond.
	test("L'aperçu compte les membres retenus", async () => {
		await page.goto(`/${event.eventId}/teams?form_team=%7B%7D`)
		await expect(page.getByText('Visible pour tous les membres')).toBeVisible()

		await expect(async () => {
			await page.getByRole('button', { name: 'Ajouter une condition' }).click()
			await page.getByRole('button', { name: 'Membre approuvé' }).click({ timeout: 1000 })
		}).toPass()

		await expect(page.getByText('Visible pour 1 membre')).toBeVisible()

		// Le tiroir garde sa copie tant qu'il reste monté: on le referme pour que le test
		// suivant reparte d'un secteur vierge.
		await page.goto(`/${event.eventId}/teams`)
		await expect(page.getByRole('dialog')).toHaveCount(0)
	})

	test('Création du secteur avec deux conditions', async () => {
		await page.goto(`/${event.eventId}/teams?form_team=%7B%7D`)

		// Le menu ne s'ouvre qu'une fois la page hydratée. Rejouer le couple ouverture/choix
		// l'attend sans avoir à le deviner: tant que le choix échoue, aucune condition n'a
		// été ajoutée, et rouvrir un menu déjà ouvert ne coûte rien.
		const addCondition = async (label: string) => {
			await expect(async () => {
				await page.getByRole('button', { name: 'Ajouter une condition' }).click()
				await page.getByRole('button', { name: label }).click({ timeout: 1000 })
			}).toPass()
		}

		// Condition "Âge minimum"
		await addCondition('Âge minimum')
		await expect(page.getByLabel('Âge minimum')).toHaveValue('18')

		// Condition "Profil du membre" sur Ville = Lyon
		await addCondition('Profil du membre')
		await page.getByRole('button', { name: 'Sélectioner un champ' }).click()
		await page.getByRole('option', { name: 'Ville' }).click()
		await fillCondition(page, page.getByLabel('Valeur'), 'Lyon', /"expectedValue":"Lyon"/)

		// Le nom en dernier: saisi avant l'hydratation, il serait écrasé par le rendu client,
		// qui repose la valeur initiale du champ. Les conditions, elles, ont déjà attendu.
		await page.getByLabel('Nom du secteur').fill('Secteur Cond')

		await page.getByRole('button', { name: 'Valider', exact: true }).last().click()
		await expect(page.getByRole('link', { name: /Secteur Cond/ }).first()).toBeVisible()
	})

	test('Réouverture: les valeurs enregistrées sont restituées', async () => {
		await page.goto(`/${event.eventId}/teams`)
		// Le crayon d'édition n'a pas de nom accessible: on le vise par son href.
		await page.locator('a[href*="form_team="]:not([href*="%7B%7D"])').first().click()
		await expect(page.getByRole('dialog', { name: /Modifier le secteur/ })).toBeVisible()

		await expect(page.getByLabel('Âge minimum')).toHaveValue('18')
		await expect(page.getByLabel('Valeur')).toHaveValue('Lyon')
		editUrl = page.url()
	})

	// LE cas de régression: modifier une condition déjà enregistrée. Avant correctif, les
	// écritures dans le tableau non-proxy passaient inaperçues et étaient perdues.
	test('Modification de conditions existantes', async () => {
		await fillCondition(page, page.getByLabel('Âge minimum'), '25', /"args":25/)
		await fillCondition(page, page.getByLabel('Valeur'), 'Paris', /"expectedValue":"Paris"/)

		await page.getByRole('button', { name: 'Valider', exact: true }).last().click()
		// Le tiroir ne se referme qu'au succès: c'est lui, et non le secteur déjà listé, qui
		// prouve que l'écriture est partie avant qu'on aille la relire.
		await expect(page.getByRole('dialog', { name: /Modifier le secteur/ })).toBeHidden()

		await page.goto(editUrl)
		await expect(page.getByRole('dialog', { name: /Modifier le secteur/ })).toBeVisible()

		await expect(page.getByLabel('Âge minimum')).toHaveValue('25')
		await expect(page.getByLabel('Valeur')).toHaveValue('Paris')
	})
})
