import { expect, test, type Page } from '@playwright/test'
import { useEvent } from './event'
import { seedUser, signIn } from './seed'
import { awaitHydrated, gotoHydrated } from './hydrated'

/**
 * Le modèle de badge se règle par des `InputSelect` sur des champs de profil, dont l'un se crée
 * depuis le sélecteur lui-même. Le champ créé doit rejoindre le sélecteur qui l'a demandé, et lui
 * seul, et le nuancier suivre ses options.
 */
test.describe.serial('Modèle de badge', () => {
	const event = useEvent('Badgerie')
	let page: Page

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
	})
	test.afterAll(async () => page.close())

	test('Préparation: un évènement', async () => {
		await signIn(page, await seedUser('Bobbadge'))
		await event.create(page)
	})

	test('Le champ créé depuis un sélecteur y prend place, avec son nuancier', async () => {
		const saveBar = page.getByText('Modification en cours !')
		await gotoHydrated(page, `/${event.eventId}/admin/pages`)
		await page
			.locator('section')
			.filter({ hasText: 'Modèles de badge' })
			.getByRole('button')
			.first()
			.click()
		await page.waitForURL('**/admin/pages/badges/**')
		await expect(page.getByLabel('Nom du badge')).toBeVisible()

		const typeTrigger = page.getByRole('button', { name: 'Champ: Type de membre' })
		const labelTrigger = page.getByRole('button', { name: 'Champ: Label' })
		await expect(typeTrigger).toBeVisible()

		// Le sélecteur porte un lien vers le tiroir de création: le champ manquant se définit
		// sans quitter le modèle.
		await typeTrigger.click()
		await expect(page.getByRole('link', { name: 'Nouveau champ' })).toBeVisible()
		await page.getByRole('link', { name: 'Nouveau champ' }).click()
		const drawer = page.getByRole('dialog', { name: 'Nouveau champ' })
		await expect(drawer).toBeVisible()
		await expect(page.getByRole('button', { name: 'Type de champ' })).toContainText('Liste à choix')
		await page.getByLabel('Nom', { exact: true }).fill('Type de membre')
		const newOption = page.getByPlaceholder('Nouvelle option')
		for (const option of ['Bénévole', 'Respo']) {
			await newOption.fill(option)
			await newOption.press('Enter')
		}
		await page.getByRole('button', { name: 'Valider', exact: true }).last().click()
		await expect(drawer).toBeHidden()

		// Le champ créé prend place dans le sélecteur qui l'a demandé, et lui seul.
		await expect(typeTrigger).toContainText('Type de membre')
		await expect(labelTrigger).toContainText('Selectionner une valeur')
		await expect(page.locator('input[name="typeField"]')).toHaveCount(1)
		// Le nuancier suit le champ choisi: une couleur par option.
		await expect(page.getByRole('button', { name: 'bénévole' })).toBeVisible()
		await expect(page.getByRole('button', { name: 'respo' })).toBeVisible()
		await expect(saveBar).toBeVisible()

		await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
		await expect(page.getByText('Badge enregistré')).toBeVisible()
		await expect(saveBar).toBeHidden()
		await page.reload()
		await awaitHydrated(page)
		await expect(page.getByRole('button', { name: 'Champ: Type de membre' })).toContainText(
			'Type de membre'
		)
		await expect(page.getByRole('button', { name: 'bénévole' })).toBeVisible()
	})
})
