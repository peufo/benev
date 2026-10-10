import { demo, expect } from 'cademo'
import { seedFestival } from './fixtures'
import { gotoHydrated } from '../tests/hydrated'

demo('planif', async ({ page, director }) => {
	const { eventId, at } = await seedFestival(page, { unplanned: ['Éco-team'] })
	// Le samedi dès 10 h au bord gauche, à une échelle où un créneau de quatre heures se lit.
	const cursor = at(1, 10).toJSON()
	await gotoHydrated(page, `/${eventId}/admin/plan?hourSize=30&cursor=${cursor}`)

	// Le repère du samedi: l'accueil de 14 h à 18 h donne à la fois l'heure et l'échelle.
	const reference = page.getByText('14:00 – 18:00')
	await expect(reference).toBeVisible()
	const row = page
		.locator('div.group\\/team')
		.filter({ has: page.getByRole('link', { name: 'Éco-team' }) })
		.locator('.stack-row')
		.first()
	await expect(row).toBeVisible()

	await director.start()

	// Un créneau se trace à même la grille.
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

	// Rouvert, il se duplique à la suite.
	await director.click(row.getByText('12:00 – 16:00'))
	const edit = page.getByRole('dialog', { name: "Édition d'un créneau" })
	await expect(edit).toBeVisible()
	const after = edit.getByRole('button', { name: 'Dupliquer après' })
	await director.note(after, 'Dupliquer à la suite')
	await director.click(after)
	await expect(row.getByText('16:00 – 20:00')).toBeVisible()
	await director.press('Escape')
	await expect(edit).toBeHidden()

	// Le suivi: qui vient, créneau par créneau.
	const slots = page.locator('a[href*="showSlots"]')
	await director.note(slots, 'Afficher les inscriptions', { placement: 'bottom' })
	await director.click(slots)
	await expect(page.getByRole('listitem').filter({ hasText: 'Libre' }).first()).toBeVisible()

	// La règle se saisit pour parcourir le week-end: retour au montage du vendredi.
	// La règle est aussi large que la plage entière: le repère est la partie visible de la grille.
	const scale = page.locator('div.cursor-grab').first()
	const ruler = (await scale.boundingBox())!.y + 30
	const grid = (await scale.locator('xpath=..').boundingBox())!
	const montage = (await page.getByText('13:00 – 18:00').boundingBox())!
	const from = grid.x + 160
	const to = Math.min(grid.x + grid.width - 40, from + (grid.x + 140 - montage.x))
	// Le geste se lit sur toute la grille, pas sur la règle qu'on tient.
	await director.focus(null)
	await director.drag({ x: from, y: ruler }, { x: to, y: ruler })
	await director.pause(2500)
})
