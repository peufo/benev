import { test, type Page } from '@playwright/test'
import { useEvent } from './event'
import { seedTeam, seedUser, signIn } from './seed'

test.describe.serial("Réglages de l'évènement", () => {
	const event = useEvent('Reglages')
	let page: Page

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
	})
	test.afterAll(async () => {
		await page.close()
	})

	test('Préparation: un évènement, un secteur en brouillon', async () => {
		await signIn(page, await seedUser('Cave'))
		await event.create(page)
		await seedTeam(event.eventId, 'Alpha')
	})

	test('La barre de sauvegarde des réglages suit les modifications', async () => {
		await event.expectSettingsSaveBar(page)
	})

	test("Le thème posé à la création se change, s'enregistre et se retire", async () => {
		await event.expectThemePresets(page)
	})

	test('La fin des inscriptions par défaut se lit sur le secteur et sa carte', async () => {
		await event.expectDefaultCloseSubscribing(page)
	})
})
