import { demo, expect } from 'cademo'
import { CHARTER, seedFestival } from './fixtures'
import { gotoHydrated } from '../tests/hydrated'

demo('create-pages', async ({ page, director }) => {
	const { eventId } = await seedFestival(page, { volunteers: false })
	await gotoHydrated(page, `/${eventId}/admin/pages`)

	await director.start()

	await director.click(page.getByRole('button', { name: 'Nouvelle page' }))
	await page.waitForURL(/\/admin\/pages\/\w+$/)
	await director.type(page.getByLabel('Titre'), 'Charte', { clear: true })

	// Le libellé « Type de page » n'est pas relié au sélecteur: il ne se nomme que par sa valeur.
	const type = page.getByRole('button', { name: 'Page publique' })
	await director.note(type, "Acceptée par chaque bénévole à l'inscription")
	await director.click(type)
	await director.click(page.getByRole('option', { name: 'Charte des bénévoles' }))

	// Le texte arrive d'un document existant: un collage, mis en forme.
	const editor = page.locator('.tiptap')
	await director.click(editor)
	await editor.evaluate((element, html) => {
		const data = new DataTransfer()
		data.setData('text/html', html)
		element.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true }))
	}, CHARTER)
	await expect(editor.getByText('Nos valeurs')).toBeVisible()

	// Rédigée, elle peut être publiée.
	await director.click(page.getByRole('button', { name: 'Statut' }))
	await director.click(page.getByRole('option', { name: /Page publiée/ }))

	await director.click(page.getByRole('button', { name: 'Enregistrer les modifications' }))
	await expect(page.getByText('Page enregistrée')).toBeVisible()

	// La page rejoint la navigation du site
	await director.click(page.getByRole('banner').getByRole('link', { name: 'Charte' }))
	await expect(page.getByRole('heading', { name: 'Nos valeurs' })).toBeVisible()
	await director.pause(2000)
})
