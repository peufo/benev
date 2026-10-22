import { test, type Page } from '@playwright/test'
import { useEvent } from './event'
import { seedUser, signIn } from './seed'

test.describe.serial('Publications et médiathèque', () => {
	const event = useEvent('Editeur')
	let page: Page

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
	})
	test.afterAll(async () => {
		await page.close()
	})

	test('Préparation: un évènement', async () => {
		await signIn(page, await seedUser('Eli'))
		await event.create(page)
	})

	test("L'édition d'une page s'enregistre par la barre de sauvegarde", async () => {
		await event.expectPageEditorSaveBar(page)
	})

	test('La médiathèque est un tiroir unique', async () => {
		await event.expectMediaDrawer(page)
	})
})
