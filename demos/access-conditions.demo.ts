import { demo, expect } from 'cademo'
import { prisma } from '../tests/seed'
import { seedFestival } from './fixtures'
import { gotoHydrated } from '../tests/hydrated'

/**
 * Le bar est réservé aux majeur·es: une condition d'âge suffit, et le compteur de la section dit
 * aussitôt combien de membres le verront encore.
 */
demo('access-conditions', async ({ page, director }) => {
	const { eventId, teams, members } = await seedFestival(page)
	const bar = teams.find((team) => team.name === 'Bar principal')!
	// Sans date de naissance, un membre échoue à toute condition d'âge et le compteur tomberait à
	// zéro. Une poignée de mineur·es rend le tri visible.
	const now = new Date()
	for (const [index, member] of members.entries()) {
		const age = index % 6 === 5 ? 16 + (index % 2) : 19 + ((index * 7) % 27)
		const birthday = new Date(now.getFullYear() - age, (index * 5) % 12, 1 + (index % 27))
		await prisma.member.update({ where: { id: member.id }, data: { birthday } })
	}
	await gotoHydrated(page, `/${eventId}/admin/teams/${bar.id}`)
	const conditions = page.locator('#conditions')
	await expect(conditions.getByText('Visible pour tous les membres')).toBeVisible()

	await director.start()

	// La fiche entière d'abord: le bar, et sa section des conditions encore vide.
	await director.focus(null)
	await director.pause(1500)
	// La section n'a pas de titre que la caméra sache lire: sans cadrage imposé, elle resterait
	// sur la fiche entière, où le champ d'âge et le compteur ne se lisent pas.
	await director.focus(conditions)

	await director.click(conditions.getByRole('button', { name: 'Ajouter une condition' }))
	await director.click(page.getByRole('button', { name: 'Âge minimum' }))

	const age = conditions.getByLabel('Âge minimum')
	await expect(age).toBeVisible()
	await director.note(age, 'Le bar est réservé aux majeur·es')
	await director.type(age, '18', { clear: true })
	const counter = conditions.getByText(/Visible pour \d+ membres/)
	await expect(counter).toBeVisible()
	// Le compteur a suivi la saisie: il se lit avant que la main ne parte enregistrer.
	await director.pause(1000)

	// La barre d'enregistrement flotte en bas de l'écran, hors de la section.
	await director.focus(null)
	await director.click(page.getByRole('button', { name: 'Enregistrer les modifications' }))
	await expect(page.getByText('Succès')).toBeVisible()
	await expect(page.getByText('Modification en cours !')).toBeHidden()

	// La condition est enregistrée. La main désigne ce qu'elle change, les membres qui verront
	// encore le bar, par l'icône: posée sur le texte, elle masquerait le nombre. La vue reste
	// entière, un cadrage serré couperait le toast de succès.
	await director.hover(counter.locator('..').locator('svg'))
	await director.pause(3000)
})
