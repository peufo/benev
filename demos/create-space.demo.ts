import { fileURLToPath } from 'node:url'
import { demo, expect } from 'cademo'
import { seedOrganizer } from './fixtures'
import { mockPhoton } from '../tests/photon'
import { gotoHydrated } from '../tests/hydrated'

const LOGO = fileURLToPath(new URL('./assets/logo-festival.png', import.meta.url))

demo('create-space', async ({ page, director }) => {
	await seedOrganizer(page)
	await mockPhoton(page)
	await gotoHydrated(page, '/me/events/create')
	await expect(page.getByRole('heading', { name: 'Nouvel évènement' })).toBeVisible()

	await director.start()

	// La création
	await director.type(page.getByLabel("Nom de l'évènement"), 'Festival des Lumières')
	const url = page.getByLabel("URL de l'évènement")
	await expect(url).toHaveValue('festival-des-lumieres')
	await director.click(page.getByRole('button', { name: 'Créer mon évènement' }))
	await page.waitForURL('**/festival-des-lumieres/admin/dashboard')

	// L'identité
	await director.click(page.getByRole('link', { name: 'Configuration', exact: true }))
	// Le menu latéral, ouvert au survol, se replie quand la main le quitte et décale le sommaire:
	// la main part vers « Identité », puis rattrape le lien une fois le sommaire immobile.
	const identity = page.getByRole('link', { name: 'Identité', exact: true })
	await director.focus(null)
	await director.hover(identity)
	await page.waitForFunction(() => document.getAnimations().length === 0)
	await director.focus('auto')
	await director.click(identity)
	const logo = page.getByRole('button', { name: 'Logo', exact: true })
	await director.click(logo)
	const drawer = page.getByRole('dialog', { name: 'Médiathèque' })
	await expect(drawer).toBeVisible()
	// Le sélecteur de fichiers du système n'est pas filmable: le fichier arrive directement.
	await page.locator('input[type="file"][name="image"]').setInputFiles(LOGO)
	const description = page.getByLabel("Description de l'image")
	await expect(description).toBeVisible()
	await director.click(page.getByRole('button', { name: '1:1', exact: true }))
	await director.type(description, 'Logo du festival')
	await director.click(page.getByRole('button', { name: 'Valider', exact: true }))
	await expect(drawer).toBeHidden()
	await expect(logo.getByRole('img')).toBeVisible()

	await director.click(page.getByRole('radio', { name: 'Crépuscule' }))
	await director.click(page.getByRole('radio', { name: 'benevio' }))
	await director.click(page.getByRole('button', { name: 'Enregistrer les modifications' }))
	await expect(page.getByText('Modifications enregistrées')).toBeVisible()

	// Le résultat, côté bénévoles
	await director.click(page.getByRole('link', { name: 'Bienvenue' }))
	await expect(page.getByRole('img', { name: 'logo of Festival des Lumières' })).toBeVisible()
	await director.pause(2000)
})
