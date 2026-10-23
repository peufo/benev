import { demo, expect } from 'cademo'
import { prisma } from '../tests/seed'
import { seedFestival } from './fixtures'
import { awaitHydrated, gotoHydrated } from '../tests/hydrated'

/**
 * Le soir du samedi, au bar: deux bénévoles ne sont pas venu·es. L'absence se pointe dans la table
 * des inscriptions, et la table des membres la retrouve sur la ligne de chacun·e.
 */
demo('presences', async ({ page, director }) => {
	const { eventId, teams, at } = await seedFestival(page)
	const bar = teams.find((team) => team.name === 'Bar principal')!
	// Le filtre retient les créneaux qui chevauchent sa plage: celle-ci ne garde que le samedi de
	// 17 h à 21 h. Plus large, la colonne « Créneau » pousserait le menu « … » hors de la table.
	const saturday = { start: at(1, 18), end: at(1, 20) }
	const subscribes = await prisma.subscribe.findMany({
		where: {
			state: 'accepted',
			period: { teamId: bar.id, start: { lte: saturday.end }, end: { gte: saturday.start } },
		},
		include: { member: true },
	})
	// Une personne inscrite aux deux créneaux du soir aurait deux lignes: on en choisit qui n'en
	// ont qu'une, pour que l'alerte de la table des membres dise « 1 créneau ».
	const once = subscribes.filter(
		(sub) => subscribes.filter((other) => other.memberId === sub.memberId).length === 1
	)
	const [first, second] = [once[0], once[2] ?? once[1]].map(
		(sub) => `${sub.member.firstName} ${sub.member.lastName}`
	)

	const query = new URLSearchParams({
		teams: JSON.stringify([bar.id]),
		period: JSON.stringify(saturday),
		states: JSON.stringify(['accepted']),
		subscribes_fields_visible: JSON.stringify(['isAbsent']),
		subscribes_fields_hidden: JSON.stringify(['createdAt']),
	})
	await gotoHydrated(page, `/${eventId}/admin/subscribes?${query}`)
	const rowOf = (name: string) => page.getByRole('row').filter({ hasText: name })
	await expect(rowOf(first)).toBeVisible()

	await director.start()
	// Sans cadrage imposé, la caméra recule vers la vue entière pendant que le second menu est
	// encore ouvert, pour préparer un changement de page que la coupe de `goto` rend inutile.
	await director.focus(page.getByRole('table'))

	for (const [index, name] of [first, second].entries()) {
		const row = rowOf(name)
		const menu = row.getByRole('button').filter({ has: page.locator('.lucide-ellipsis') })
		if (index === 0) await director.note(menu, "L'absence se note créneau par créneau")
		await director.click(menu)
		await director.click(row.getByRole('button', { name: 'Marquer comme absent' }))
		// Le menu refermé, il ne reste qu'une alerte sur la ligne: celle de la colonne « Absent ».
		await expect(row.locator('.lucide-triangle-alert')).toBeVisible()
	}

	// Le menu latéral s'élargit sous la souris et pousse la page: le traverser pour aller aux
	// membres ferait sauter tout l'écran deux fois. La navigation se fait donc hors du geste.
	await director.goto(`/${eventId}/admin/members`, {
		ready: async (page) => {
			await awaitHydrated(page)
			await expect(page.getByRole('columnheader', { name: /Heures de travail/ })).toBeVisible()
		},
	})
	await director.focus('auto')

	// Sous le filtre « Bénévoles », de quoi ne garder que qui a manqué un créneau.
	const volunteers = page.locator('a[href*="role=member"]').first()
	await director.click(volunteers)
	const absent = page.locator('a[href*="isAbsent=true"]')
	await director.click(absent)
	// L'en-tête et les deux absent·es, personne d'autre.
	await expect(page.getByRole('row')).toHaveCount(3)
	await expect(page.getByRole('row').filter({ hasText: second })).toBeVisible()

	const alert = page
		.getByRole('row')
		.filter({ hasText: first })
		.locator('.lucide-triangle-alert')
		.first()
	// La caméra repartirait sur la vue entière pour finir, où l'infobulle ne se lit plus. La table
	// occupe toute la largeur et ne donnerait aucun zoom: le cadrage se pose sur la colonne des
	// noms, où se lisent les deux alertes.
	await director.focus(page.getByRole('columnheader', { name: 'Membre' }), { scale: 1.8 })
	await director.hover(alert)
	await expect(page.getByText('Absent à 1 créneau')).toBeVisible()
	await director.pause(2500)
})
