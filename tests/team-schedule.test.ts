import { expect, test, type Page } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { useUser } from './user'
import { useEvent } from './event'

const prisma = new PrismaClient()

/**
 * Une date de fermeture referme un secteur publié, sans personne au clavier. Le ticker est coupé
 * par la configuration Playwright: c'est `/root/tasks` qui déclenche le passage, d'où le root.
 */
test.describe.serial('Transitions programmées d’un secteur', () => {
	const root = useUser('Root', 'root@benevio.test')
	const event = useEvent(root, 'Programme')
	let page: Page

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
	})
	test.afterAll(async () => {
		await page.close()
		await prisma.$disconnect()
	})

	async function runTeamSchedule() {
		await page.goto('/root/tasks')
		const row = page.getByRole('row').filter({ hasText: 'team-schedule' })
		await row.getByRole('button', { name: 'Exécuter' }).click()
		const toast = page.getByText(/team-schedule: \d+ effet/)
		await expect(toast).toBeVisible()
		return (await toast.textContent()) ?? ''
	}

	test('Préparation: un évènement, un secteur publié', async () => {
		await root.loginOrRegister(page)
		await event.create(page)

		await page.goto(`/${event.eventId}/admin/teams`)
		const newTeam = page.locator('a[href*="form_team=%7B%7D"]').first()
		const teamDrawer = page.getByRole('dialog', { name: 'Nouveau secteur' })
		await expect(async () => {
			await newTeam.click()
			await expect(teamDrawer).toBeVisible({ timeout: 1000 })
		}).toPass()
		const teamName = teamDrawer.getByLabel('Nom du secteur')
		await expect(async () => {
			await teamName.fill('Alpha')
			await expect(teamName).toHaveValue('Alpha', { timeout: 1000 })
		}).toPass()
		await teamDrawer.getByRole('button', { name: 'Valider', exact: true }).click()
		await expect(page.getByText('Secteur créé en brouillon')).toBeVisible()

		await page.getByRole('button', { name: 'Brouillon', exact: true }).click()
		await page.getByRole('button', { name: 'Valider et ouvrir les inscriptions' }).click()
		await page.getByRole('dialog').getByRole('button', { name: 'Confirmer' }).click()
		await expect(page.getByRole('button', { name: 'Publié', exact: true })).toBeVisible()
	})

	test("La fermeture programmée referme le secteur et s'inscrit au journal", async () => {
		// Le premier passage pose le curseur: une date antérieure ne rejouerait pas.
		await runTeamSchedule()
		await prisma.team.updateMany({
			where: { eventId: event.eventId, name: 'Alpha' },
			data: { closeSubscribing: new Date() },
		})
		expect(await runTeamSchedule()).toContain('1 effet')

		await page.goto(`/${event.eventId}/admin/teams`)
		await page.getByRole('link', { name: 'Alpha' }).click()
		await expect(page.getByRole('button', { name: 'Validé', exact: true })).toBeVisible()

		await page.goto(`/${event.eventId}/admin/dashboard`)
		const entries = page.locator('#journal').getByRole('listitem')
		await expect(
			entries.filter({ hasText: 'Comme programmé, le statut du secteur Alpha a changé' })
		).toHaveCount(1)
	})

	test('Une fermeture posée puis vidée depuis le formulaire', async () => {
		// La date ne s'annonce que sur un secteur ouvert: il faut d'abord le rouvrir.
		await page.goto(`/${event.eventId}/admin/teams`)
		await page.getByRole('link', { name: 'Alpha' }).click()
		await page.getByRole('button', { name: 'Validé', exact: true }).click()
		await page.getByRole('button', { name: 'Ouvrir les inscriptions' }).click()
		await expect(page.getByRole('button', { name: 'Publié', exact: true })).toBeVisible()
		const closeSubscribing = page.locator('#team').getByLabel('Fermeture des inscriptions')
		const saveBar = page.getByText('Modification en cours !')
		await expect(async () => {
			await closeSubscribing.fill('2099-01-01T12:00')
			await expect(saveBar).toBeVisible({ timeout: 1000 })
		}).toPass()
		await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
		await expect(saveBar).toBeHidden()
		await page.reload()
		await expect(page.getByText('Fin des inscriptions le 01 janvier 2099 à 12:00')).toBeVisible()

		// Le champ vidé part à blanc: la date est effacée, pas laissée intacte.
		await expect(async () => {
			await closeSubscribing.fill('')
			await expect(saveBar).toBeVisible({ timeout: 1000 })
		}).toPass()
		await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
		await expect(saveBar).toBeHidden()
		await page.reload()
		await expect(page.getByText('Fin des inscriptions le 01 janvier 2099 à 12:00')).toHaveCount(0)
	})
})
