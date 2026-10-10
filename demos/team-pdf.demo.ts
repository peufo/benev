import { demo, expect } from 'cademo'
import { showInPlace, seedFestival } from './fixtures'
import { gotoHydrated } from '../tests/hydrated'

demo('team-pdf', async ({ page, director }) => {
	const { eventId } = await seedFestival(page)
	await gotoHydrated(page, `/${eventId}/admin/teams`)

	await director.start()

	await director.click(page.getByRole('link', { name: 'Bar principal' }))
	const pdf = page.locator('a[href$="/pdf"]')
	await expect(page.getByRole('heading', { name: 'Bar principal' })).toBeVisible()

	await director.note(pdf, 'Une feuille par secteur, prête à imprimer')
	const popup = page.waitForEvent('popup')
	await director.click(pdf)
	await director.skip(() => showInPlace(page, popup))

	// Le document se montre entier: rien, dans le visualiseur, n'appelle un gros plan.
	await director.focus(null)
	// Le visualiseur de Chromium: ses contrôles ne sont pas dans le DOM de la page.
	await director.moveTo({ x: 760, y: 420 })
	for (let i = 0; i < 24; i++) {
		await page.mouse.wheel(0, 25)
		await page.waitForTimeout(16)
	}
	await director.pause(800)
	await director.moveTo({ x: 1211, y: 28 })
	await director.pause(1500)
})
