import { demo, expect } from 'cademo'
import { prisma } from '../tests/seed'
import { seedFestival } from './fixtures'
import { gotoHydrated } from '../tests/hydrated'

demo('export-data', async ({ page, director }) => {
	const { eventId, teams } = await seedFestival(page)
	// La vue que pose la démo `create-view`.
	const bar = teams.find((team) => team.name === 'Bar principal')!
	const query = new URLSearchParams({
		members_fields_visible: JSON.stringify(['member.phone']),
		subscribes_teams: JSON.stringify([bar.id]),
	})
	// La requête telle que la page la réécrit: c'est à elle que le sélecteur compare chaque vue.
	await gotoHydrated(page, `/${eventId}/admin/members?${query}`)
	await expect(page.getByRole('columnheader', { name: 'Téléphone', exact: true })).toBeVisible()
	const saved = new URL(page.url()).searchParams.toString()
	await prisma.view.create({
		data: { eventId, key: 'members', name: 'Équipe du bar', query: saved },
	})
	await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
	await gotoHydrated(page, `/${eventId}/admin/members`)

	await director.start()

	await director.click(page.getByRole('button', { name: 'Vue simple' }))
	await director.click(page.getByRole('option', { name: 'Équipe du bar' }))
	await expect(page.getByRole('button', { name: 'Équipe du bar' })).toBeVisible()

	// Ce qui s'exporte, c'est ce que la vue montre.
	const exportButton = page.getByRole('button').filter({ has: page.locator('.lucide-download') })
	await director.click(exportButton)
	const copy = page.getByRole('button', { name: 'Copier les données' })
	await director.note(copy, 'À coller dans ton tableur')
	await director.click(copy)
	await expect(page.getByText('Données copiées !')).toBeVisible()
	await director.pause(1500)
})
