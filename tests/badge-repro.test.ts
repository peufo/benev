import { expect, test, type Page } from '@playwright/test'
import { useUser } from './user'
import { useEvent } from './event'

const BLUE_SQUARE_PNG =
	'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAUElEQVR42u3PQQkAAAgEsEtjMeNbwgi+hcEKLNXzWgQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQErsACvwRBWjdZC+AAAAAASUVORK5CYII='

test.describe.serial('Badge repro', () => {
	const bob = useUser('Bobbadge')
	const event = useEvent(bob, 'Badgerie')
	let page: Page

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
		page.on('console', (m) => console.log('[console]', m.type(), m.text()))
		page.on('pageerror', (e) => console.log('[pageerror]', e.message, '\n', e.stack))
	})
	test.afterAll(async () => page.close())

	test('setup', async () => {
		await bob.register(page)
		await event.create(page)
	})

	test('badge form', async () => {
		const saveBar = page.getByText('Modification en cours !')
		await page.goto(`/${event.eventId}/admin/pages`)
		await page
			.locator('section')
			.filter({ hasText: 'Modèles de badge' })
			.getByRole('button')
			.first()
			.click()
		await page.waitForURL('**/admin/pages/badges/**')
		await expect(page.getByLabel('Nom de la configuration')).toBeVisible()

		const typeTrigger = page.getByRole('button', { name: 'Champ: Type de membre' })
		const labelTrigger = page.getByRole('button', { name: 'Champ: Label' })
		await expect(typeTrigger).toBeVisible()

		// --- bug 2: création d'un champ depuis le bouton du select
		await expect(async () => {
			await typeTrigger.click()
			await expect(page.getByRole('link', { name: 'Nouveau champ' })).toBeVisible({ timeout: 1000 })
		}).toPass()
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
		// --- bug 1: le nuancier suit le champ choisi
		await expect(page.getByRole('button', { name: 'bénévole' })).toBeVisible()
		await expect(page.getByRole('button', { name: 'respo' })).toBeVisible()
		await expect(saveBar).toBeVisible()

		await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
		await expect(page.getByText('Badge enregistré')).toBeVisible()
		await expect(saveBar).toBeHidden()
		await page.reload()
		await expect(page.getByRole('button', { name: 'Champ: Type de membre' })).toContainText(
			'Type de membre'
		)
		await expect(page.getByRole('button', { name: 'bénévole' })).toBeVisible()
	})

	test('media', async () => {
		const saveBar = page.getByText('Modification en cours !')
		const background = page.getByRole('button', { name: 'Image de fond', exact: true })
		const drawer = page.getByRole('dialog', { name: 'Médiathèque' })
		await expect(async () => {
			await background.click()
			await expect(drawer).toBeVisible({ timeout: 1000 })
		}).toPass()
		await page.locator('input[type="file"][name="image"]').setInputFiles({
			name: 'fond.png',
			mimeType: 'image/png',
			buffer: Buffer.from(BLUE_SQUARE_PNG, 'base64'),
		})
		await page.getByLabel("Description de l'image").fill('Fond test')
		await page.getByRole('button', { name: 'Valider', exact: true }).click()
		await expect(drawer).toBeHidden()

		// --- bug 3: l'image envoyée reste choisie, malgré les `load` que rejoue la soumission
		await expect(page.locator('input[name="backgroundId"]')).not.toHaveValue('')
		await expect(saveBar).toBeVisible()
		await page.waitForTimeout(1500)
		await expect(page.locator('input[name="backgroundId"]')).not.toHaveValue('')
		await expect(saveBar).toBeVisible()

		await page.getByRole('button', { name: 'Réinitialiser' }).click()
		await expect(saveBar).toBeHidden()
		await expect(page.locator('input[name="backgroundId"]')).toHaveValue('')
	})
})
