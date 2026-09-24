import { expect, test, type Page } from '@playwright/test'
import { useEvent } from './event'
import { prisma, seedTeam, seedUser, signIn } from './seed'
import { gotoHydrated } from './hydrated'

/**
 * Une date de fermeture referme un secteur publié, sans personne au clavier. Le ticker est coupé
 * par la configuration Playwright: c'est `/root/tasks` qui déclenche le passage, d'où le root.
 */
test.describe.serial('Transitions programmées d’un secteur', () => {
	const event = useEvent('Programme')
	let page: Page

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
	})
	test.afterAll(async () => {
		await page.close()
		await prisma.$disconnect()
	})

	async function runTeamSchedule() {
		await gotoHydrated(page, '/root/tasks')
		const row = page.getByRole('row').filter({ hasText: 'team-schedule' })
		await row.getByRole('button', { name: 'Exécuter' }).click()
		const toast = page.getByText(/team-schedule: \d+ effet/)
		await expect(toast).toBeVisible()
		return (await toast.textContent()) ?? ''
	}

	test('Préparation: un évènement, un secteur publié', async () => {
		// `/root/tasks` n'est ouvert qu'à `ROOT_USER`, dont `playwright.config.ts` fixe l'adresse.
		await signIn(page, await seedUser('Root', { email: 'root@benevio.test' }))
		await event.create(page)
		await seedTeam(event.eventId, 'Alpha', 'published')
	})

	test("La fermeture programmée referme le secteur et s'inscrit au journal", async () => {
		// Le premier passage pose le curseur: une date antérieure ne rejouerait pas.
		await runTeamSchedule()
		await prisma.team.updateMany({
			where: { eventId: event.eventId, name: 'Alpha' },
			data: { closeSubscribing: new Date() },
		})
		expect(await runTeamSchedule()).toContain('1 effet')

		await gotoHydrated(page, `/${event.eventId}/admin/teams`)
		await page.getByRole('link', { name: 'Alpha' }).click()
		await expect(page.getByRole('button', { name: 'Validé', exact: true })).toBeVisible()

		await gotoHydrated(page, `/${event.eventId}/admin/dashboard`)
		const entries = page.locator('#journal').getByRole('listitem')
		await expect(
			entries.filter({ hasText: 'Comme programmé, le statut du secteur Alpha a changé' })
		).toHaveCount(1)
	})
})
