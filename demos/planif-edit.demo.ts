import { demo, expect } from 'cademo'
import { seedFestival } from './fixtures'
import { gotoHydrated } from '../tests/hydrated'

demo('planif-edit', async ({ page, director }) => {
	const { eventId } = await seedFestival(page, { unplanned: ['Éco-team'] })
	await gotoHydrated(page, `/${eventId}/admin/plan`)

	// Le repère du samedi: l'accueil de 14 h à 18 h donne à la fois l'heure et l'échelle.
	const reference = page.getByText('14:00 – 18:00')
	await reference.scrollIntoViewIfNeeded()
	const row = page
		.locator('div.group\\/team')
		.filter({ has: page.getByRole('link', { name: 'Éco-team' }) })
		.locator('.stack-row')
		.first()
	await expect(row).toBeVisible()

	await director.start()

	const card = (await reference.locator('xpath=ancestor::div[@id][1]').boundingBox())!
	const hour = card.width / 4
	const lane = (await row.boundingBox())!
	const y = lane.y + lane.height / 2
	await director.drag({ x: card.x - 2 * hour, y }, { x: card.x + 2 * hour, y })

	const drawer = page.getByRole('dialog', { name: "Création d'un créneau" })
	await expect(drawer).toBeVisible()
	await director.type(drawer.getByLabel('Nombre de bénévoles'), '3', { clear: true })
	await director.click(drawer.getByRole('button', { name: 'Ajouter' }))
	await expect(drawer).toBeHidden()

	// Le créneau rouvert se duplique à la suite, autant de fois qu'il le faut.
	await director.click(row.getByText('12:00 – 16:00'))
	const edit = page.getByRole('dialog', { name: "Édition d'un créneau" })
	await expect(edit).toBeVisible()
	const after = edit.getByRole('button', { name: 'Dupliquer après' })
	await director.note(after, 'Dupliquer à la suite')
	await director.click(after)
	await expect(row.getByText('16:00 – 20:00')).toBeVisible()
	await director.click(after)
	await expect(row.getByText('20:00 – 00:00')).toBeVisible()
	await director.press('Escape')
	await expect(edit).toBeHidden()
	await director.pause(1500)
})
