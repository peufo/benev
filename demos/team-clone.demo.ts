import { demo, expect } from 'cademo'
import { prisma } from '../tests/seed'
import { seedFestival } from './fixtures'
import { gotoHydrated } from '../tests/hydrated'

/**
 * Le bar du vendredi se reconduit le dimanche: la copie garde ses créneaux et son responsable, et
 * l'aperçu du tiroir dit, créneau par créneau, sur quel jour chacun retombe.
 */
demo('team-clone', async ({ page, director }) => {
	const { eventId, teams, at } = await seedFestival(page)
	const bar = teams.find((team) => team.name === 'Bar principal')!
	// `seedFestival` étale le bar sur vendredi et samedi: le décalage ne se lit que si tous ses
	// créneaux partent du même jour. Le samedi déborderait sur celui que la copie va occuper.
	const friday = [
		[14, 17],
		[17, 20],
		[20, 23],
		[23, 26],
	] as const
	for (const [index, period] of bar.periods.entries()) {
		const hours = friday[index]
		await prisma.period.update({
			where: { id: period.id },
			data: { start: at(0, hours[0]), end: at(0, hours[1]) },
		})
	}
	// Une copie restée d'une prise précédente porterait le même nom.
	await prisma.team.deleteMany({ where: { eventId, name: 'Bar principal copie' } })
	await gotoHydrated(page, `/${eventId}/admin/teams/${bar.id}`)

	await director.start()

	// La fiche entière d'abord: le bar et ses quatre créneaux, tous le vendredi.
	await director.focus(null)
	await director.pause(1500)
	// Le cadrage imposé tiendrait jusqu'au bout: la caméra doit pouvoir plonger dans le tiroir.
	await director.focus('auto')

	await director.click(page.getByRole('button', { name: 'Dupliquer', exact: true }))
	const drawer = page.getByRole('dialog', { name: 'Dupliquer « Bar principal »' })
	await expect(drawer).toBeVisible()
	await expect(drawer.getByText(/^samedi/).first()).toBeVisible()

	const preview = drawer.getByRole('list')
	await director.note(preview, 'Chaque créneau, à sa nouvelle date')

	await director.type(drawer.getByLabel('Décalage des dates, en jours'), '2', { clear: true })
	await expect(drawer.getByText(/^dimanche/).first()).toBeVisible()
	await expect(drawer.getByText(/^samedi/)).toHaveCount(0)
	// Le dimanche se lit avant que la main ne reparte vers le bouton.
	await director.pause(1000)

	await director.click(drawer.getByRole('button', { name: 'Dupliquer le secteur' }))
	await expect(drawer).toBeHidden()
	await expect(page.locator('#team').getByLabel('Nom du secteur')).toHaveValue(
		'Bar principal copie'
	)

	// La fiche de la copie se lit en entier: son nom, son responsable et ses créneaux du dimanche.
	await director.focus(null)
	await director.pause(1500)
	// La copie arrive en brouillon: l'infobulle de l'état dit que les bénévoles n'en voient rien.
	const draft = page.getByRole('button', { name: 'Brouillon', exact: true })
	await director.hover(draft)
	await expect(page.getByRole('tooltip')).toContainText('Les bénévoles ne voient ni le secteur')
	await director.pause(2400)
})
