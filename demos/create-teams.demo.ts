import { demo, expect } from 'cademo'
import { createEvent, seedOrganizer } from './fixtures'
import { gotoHydrated } from '../tests/hydrated'

demo('create-teams', async ({ page, director }) => {
	await seedOrganizer(page)
	const { eventId } = await createEvent(page)
	await gotoHydrated(page, `/${eventId}/admin/teams`)

	await director.start()

	await director.click(page.locator('a[href*="form_team=%7B%7D"]').first())
	const drawer = page.getByRole('dialog', { name: 'Nouveau secteur' })
	await expect(drawer).toBeVisible()
	await director.type(drawer.getByLabel('Nom du secteur'), 'Bar principal')

	await director.click(drawer.getByRole('combobox', { name: 'Responsables' }))
	await director.note(page.locator('a[href*="form_invite=%7B%7D"]'), 'Invite un responsable')
	await director.click(page.locator('a[href*="form_invite=%7B%7D"]'))
	const invite = page.getByRole('dialog', { name: 'Inviter un nouveau membre' })
	await director.type(invite.getByLabel('Prénom'), 'Alice')
	await director.type(invite.getByLabel('Nom', { exact: true }), 'Cooper')
	await director.click(invite.getByRole('button', { name: 'Valider' }))
	await expect(invite).toBeHidden()

	await director.type(drawer.getByLabel('Description'), 'Sert des bières et tout ira bien')
	await director.click(drawer.getByRole('button', { name: 'Valider', exact: true }))
	await expect(drawer).toBeHidden()
	await director.pause(1200)
})
