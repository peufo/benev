import { demo, expect } from 'cademo'
import { seedFestival } from './fixtures'
import { gotoHydrated } from '../tests/hydrated'

demo('create-view', async ({ page, director }) => {
	const { eventId } = await seedFestival(page)
	await gotoHydrated(page, `/${eventId}/admin/members`)

	await director.start()

	// Une colonne de plus: le téléphone, pour joindre l'équipe.
	const fields = page.getByRole('columnheader').last()
	await director.click(fields.getByRole('button').first())
	await director.click(fields.getByRole('link', { name: 'Téléphone' }))
	await expect(page.getByRole('columnheader', { name: 'Téléphone', exact: true })).toBeVisible()

	// Seuls les bénévoles inscrits au bar.
	const teams = page.getByRole('columnheader', { name: /^Inscriptions \(secteur\)/ })
	await director.click(teams.getByRole('button', { name: 'Inscriptions (secteur)' }))
	await director.click(teams.getByRole('link', { name: 'Bar principal' }))
	await expect(page.getByRole('button', { name: 'Nouvelle vue' })).toBeVisible()

	// Le tout s'enregistre comme une vue, à retrouver d'un clic.
	const save = page
		.getByRole('button', { name: 'Nouvelle vue' })
		.locator('xpath=../following-sibling::button')
	await director.click(save)
	// Le `Dialog` de fuma ne se nomme pas par son titre: c'est le titre qui le désigne.
	const dialog = page
		.getByRole('dialog')
		.filter({ has: page.getByRole('heading', { name: 'Enregistrer comme nouvelle vue' }) })
	await expect(dialog).toBeVisible()
	await director.type(dialog.getByLabel('Nom de la vue'), 'Équipe du bar')
	await director.click(dialog.getByRole('button', { name: 'Valider' }))
	await expect(dialog).toBeHidden()

	const select = page.getByRole('button', { name: 'Équipe du bar' })
	await director.click(select)
	await director.click(page.getByRole('option', { name: 'Vue simple' }))
	await expect(page.getByRole('button', { name: 'Vue simple' })).toBeVisible()
	await director.click(page.getByRole('button', { name: 'Vue simple' }))
	await director.click(page.getByRole('option', { name: 'Équipe du bar' }))
	await expect(page.getByRole('columnheader', { name: 'Téléphone', exact: true })).toBeVisible()
	await director.pause(1500)
})
