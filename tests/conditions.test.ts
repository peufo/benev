import { expect, test, type Page } from '@playwright/test'
import { useUser } from './user'
import { useEvent } from './event'

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

	test('Création du secteur avec deux conditions', async () => {
		await page.goto(`/${event.eventId}/teams?form_team=%7B%7D`)
		await page.getByLabel('Nom du secteur').fill('Secteur Cond')

		// Condition "Âge minimum"
		await page.getByRole('button', { name: 'Ajouter une condition' }).click()
		await page.getByRole('button', { name: 'Âge minimum' }).click()
		await expect(page.getByLabel('Âge minimum')).toHaveValue('18')

		// Condition "Profil du membre" sur Ville = Lyon
		await page.getByRole('button', { name: 'Ajouter une condition' }).click()
		await page.getByRole('button', { name: 'Profil du membre' }).click()
		await page.getByRole('button', { name: 'Sélectioner un champ' }).click()
		await page.getByRole('option', { name: 'Ville' }).click()
		await page.getByLabel('Valeur').fill('Lyon')

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
		await page.getByLabel('Âge minimum').fill('25')
		await page.getByLabel('Valeur').fill('Paris')

		await page.getByRole('button', { name: 'Valider', exact: true }).last().click()
		await expect(page.getByRole('link', { name: /Secteur Cond/ }).first()).toBeVisible()

		await page.goto(editUrl)
		await expect(page.getByRole('dialog', { name: /Modifier le secteur/ })).toBeVisible()

		await expect(page.getByLabel('Âge minimum')).toHaveValue('25')
		await expect(page.getByLabel('Valeur')).toHaveValue('Paris')
	})
})
