import { demo, expect } from 'cademo'
import { seedFestival } from './fixtures'
import { gotoHydrated } from '../tests/hydrated'

/** Le texte de la charte, collé d'un document existant comme le ferait une organisatrice. */
const CHARTER = `
<p>Merci de rejoindre l'équipe du Festival des Lumières&nbsp;! Cette charte dit ce qu'on attend les un·es des autres.</p>
<h3>Nos valeurs</h3>
<ul>
	<li><p><strong>Bienveillance</strong>&nbsp;: envers le public, les artistes et toute l'équipe.</p></li>
	<li><p><strong>Fiabilité</strong>&nbsp;: on honore les créneaux choisis, ou on prévient à temps.</p></li>
	<li><p><strong>Sobriété</strong>&nbsp;: pas d'alcool pendant les créneaux.</p></li>
</ul>
<h3>Ce que le festival t'offre</h3>
<ul>
	<li><p>Un pass pour tout le week-end</p></li>
	<li><p>Les repas et les boissons pendant tes créneaux</p></li>
	<li><p>Le t-shirt de l'équipe</p></li>
</ul>`

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
	await director.click(page.getByRole('button', { name: 'Statut' }))
	await director.click(page.getByRole('option', { name: /Page publiée/ }))

	// Le texte arrive d'un document existant: un collage, mis en forme.
	const editor = page.locator('.tiptap')
	await director.click(editor)
	await editor.evaluate((element, html) => {
		const data = new DataTransfer()
		data.setData('text/html', html)
		element.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true }))
	}, CHARTER)
	await expect(editor.getByText('Nos valeurs')).toBeVisible()

	await director.click(page.getByRole('button', { name: 'Enregistrer les modifications' }))
	await expect(page.getByText('Page enregistrée')).toBeVisible()

	// La page rejoint la navigation du site
	await director.click(page.getByRole('banner').getByRole('link', { name: 'Charte' }))
	await expect(page.getByRole('heading', { name: 'Nos valeurs' })).toBeVisible()
	await director.pause(2000)
})
