import { expect, test, type Page } from '@playwright/test'
import { useEvent } from './event'
import { prisma, seedMember, seedPeriod, seedTeam, seedUser, signIn } from './seed'
import { gotoHydrated } from './hydrated'

const HOUR = 60 * 60_000

/**
 * Le rappel part la veille d'un créneau, sans personne au clavier. Comme pour `team-schedule`, le
 * ticker est coupé par la configuration Playwright et `/root/tasks` déclenche le passage. Les
 * courriels étant coupés eux aussi, c'est le marqueur `remindedAt` qui fait foi: le compte du
 * toast inclut les créneaux des autres tests qui tomberaient dans la même fenêtre.
 */
test.describe.serial('Rappel avant un créneau', () => {
	const event = useEvent('Rappel')
	let page: Page
	let periodId: string
	let subscribeId: string

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
	})
	test.afterAll(async () => {
		await page.close()
		await prisma.$disconnect()
	})

	async function runPeriodReminder() {
		await gotoHydrated(page, '/root/tasks')
		const row = page.getByRole('row').filter({ hasText: 'period-reminder' })
		await row.getByRole('button', { name: 'Exécuter' }).click()
		await expect(page.getByText(/period-reminder: \d+ effet/)).toBeVisible()
	}

	/** Le créneau commence dans 24 heures: son rappel par défaut tombe maintenant. */
	async function startInOneDay() {
		const start = new Date(Date.now() + 24 * HOUR)
		await prisma.period.update({
			where: { id: periodId },
			data: { start, end: new Date(start.getTime() + 2 * HOUR) },
		})
	}

	async function remindedAt() {
		const subscribe = await prisma.subscribe.findUniqueOrThrow({ where: { id: subscribeId } })
		return subscribe.remindedAt
	}

	test('Préparation: un secteur publié, une inscription acceptée', async () => {
		// `/root/tasks` n'est ouvert qu'à `ROOT_USER`, dont `playwright.config.ts` fixe l'adresse.
		await signIn(page, await seedUser('Root', { email: 'root@benevio.test' }))
		await event.create(page)
		const team = await seedTeam(event.eventId, 'Buvette', 'published')
		const period = await seedPeriod(team.id, { inDays: 7 })
		const member = await seedMember(event.eventId, await seedUser('Benevole'))
		const subscribe = await prisma.subscribe.create({
			data: { periodId: period.id, memberId: member.id, state: 'accepted' },
		})
		periodId = period.id
		subscribeId = subscribe.id
	})

	test("Un évènement qui a coupé le rappel n'en envoie pas", async () => {
		await gotoHydrated(page, `/${event.eventId}/admin/settings`)
		await page.getByRole('button', { name: /reçoit un courriel avant le début/ }).click()
		await page.getByRole('option', { name: 'Aucun rappel' }).click()
		await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
		await expect(page.getByText('Modifications enregistrées')).toBeVisible()
		const saved = await prisma.event.findUniqueOrThrow({ where: { id: event.eventId } })
		expect(saved.reminderHours).toBe(0)

		// Le premier passage pose le curseur: une date antérieure ne rejouerait pas.
		await runPeriodReminder()
		await startInOneDay()
		await runPeriodReminder()
		expect(await remindedAt()).toBeNull()
	})

	test('La veille du créneau, l’inscription acceptée reçoit son rappel', async () => {
		await prisma.event.update({ where: { id: event.eventId }, data: { reminderHours: 24 } })
		// Le curseur posé par l'étape précédente suffit: l'instant du rappel tombe après lui.
		await startInOneDay()
		await runPeriodReminder()
		expect(await remindedAt()).not.toBeNull()
	})
})
