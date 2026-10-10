import { demo, expect } from 'cademo'
import { seedFestival } from './fixtures'
import { gotoHydrated } from '../tests/hydrated'

demo('config-fields', async ({ page, director }) => {
	const { eventId } = await seedFestival(page, { volunteers: false })
	await gotoHydrated(page, `/${eventId}/admin/settings`)

	await director.start()

	// Les informations de compte exigées
	await director.click(page.getByRole('link', { name: 'Adhésion', exact: true }))
	// fuma masque la case derrière son interrupteur: c'est le libellé qui se clique.
	await director.click(page.getByText('Numéro de téléphone', { exact: true }))
	await director.click(page.getByRole('button', { name: 'Enregistrer les modifications' }))
	await expect(page.getByText('Modifications enregistrées')).toBeVisible()

	// Une question à soi: la section vient à l'écran avant que la main ne s'y rende.
	await director.scrollTo(page.locator('#fields'))
	await director.click(page.getByRole('link', { name: 'Ajouter un champ' }))
	const drawer = page.getByRole('dialog', { name: 'Nouveau champ' })
	await expect(drawer).toBeVisible()
	await director.click(drawer.getByRole('button', { name: 'Type de champ' }))
	await director.click(page.getByRole('option', { name: 'Liste à choix', exact: true }))
	await director.type(drawer.getByLabel('Nom'), 'Taille de t-shirt')
	const option = drawer.getByPlaceholder('Nouvelle option')
	await director.type(option, 'S')
	await director.press('Enter')
	// Le champ garde le focus: les options suivantes se tapent d'affilée, sans y revenir.
	for (const size of ['M', 'L', 'XL']) {
		await page.keyboard.type(size, { delay: 90 })
		await director.press('Enter')
	}
	// Obligatoire suppose modifiable et visible: les deux autres cases suivent.
	await director.click(drawer.getByText('Valeur obligatoire', { exact: true }))
	await director.click(drawer.getByRole('button', { name: 'Valider' }))
	await expect(drawer).toBeHidden()
	await expect(page.getByText('Taille de t-shirt')).toBeVisible()
	await director.pause(1500)
})
