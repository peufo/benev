import { demo, expect } from 'cademo'
import { prisma } from '../tests/seed'
import { seedFestival } from './fixtures'
import { gotoHydrated } from '../tests/hydrated'

/**
 * La cuisine se prépare en brouillon: le responsable y a déjà inscrit trois bénévoles, qui n'en
 * savent rien. La quitter envoie ces demandes, et c'est ce que la confirmation compte.
 */
demo('team-states', async ({ page, director }) => {
	const { eventId, teams, members } = await seedFestival(page)
	const kitchen = teams.find((team) => team.name === 'Cuisine')!
	await prisma.team.update({ where: { id: kitchen.id }, data: { state: 'draft' } })
	// Le tirage de `seedFestival` y a mis des inscriptions de toute sorte: le compte de la
	// confirmation doit valoir les trois demandes préparées, rien d'autre.
	await prisma.subscribe.deleteMany({ where: { period: { teamId: kitchen.id } } })
	const prepared = [
		[members[0], kitchen.periods[0]],
		[members[9], kitchen.periods[1]],
		[members[24], kitchen.periods[3]],
	] as const
	for (const [member, period] of prepared)
		await prisma.subscribe.create({
			data: { periodId: period.id, memberId: member.id, state: 'request', createdBy: 'leader' },
		})
	await gotoHydrated(page, `/${eventId}/admin/teams/${kitchen.id}`)

	await director.start()

	// La fiche entière d'abord: le secteur, ses créneaux, et l'état qu'il va quitter.
	await director.focus(null)
	await director.pause(1200)
	// Un seul plan pour le menu: la fiche et ses créneaux, que le menu déborde sur la droite.
	await director.focus(page.locator('#team').locator('..'))

	await director.click(page.getByRole('button', { name: 'Brouillon', exact: true }))
	const open = page.getByRole('button', { name: 'Valider et ouvrir les inscriptions' })
	await director.note(open, 'Les demandes partent aux bénévoles')
	await director.click(open)

	const confirmation = page.getByRole('dialog')
	await expect(confirmation).toContainText("3 demandes d'inscription partiront aux bénévoles")
	// Le message porte toute la vidéo: on le cadre et on le laisse se lire. Le `<dialog>` couvre
	// tout l'écran, c'est sa boîte qu'on cadre.
	await director.focus(confirmation.locator('.modal-box'))
	await director.pause(2500)
	await director.click(confirmation.getByRole('button', { name: 'Confirmer' }))
	await expect(confirmation).toBeHidden()

	await director.focus(null)
	const published = page.getByRole('button', { name: 'Publié', exact: true })
	await expect(published).toBeVisible()
	// L'infobulle de l'état dit ce que les bénévoles voient désormais.
	await director.hover(published)
	await expect(page.getByRole('tooltip')).toContainText('Listé pour tous les bénévoles')
	await director.pause(2600)
})
