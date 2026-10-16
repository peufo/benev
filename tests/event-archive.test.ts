import { expect, test, type Page } from '@playwright/test'
import { useEvent } from './event'
import { prisma, seedUser, signIn } from './seed'
import { gotoHydrated } from './hydrated'

const DAY = 24 * 60 * 60 * 1000
const daysAgo = (days: number) => new Date(Date.now() - days * DAY)

/**
 * Un évènement oublié reçoit son avertissement, puis s'archive sans personne au clavier. Le ticker
 * est coupé par la configuration Playwright: c'est `/root/tasks` qui déclenche le passage. La
 * tâche voit toute la base, d'où des assertions sur l'évènement plutôt que sur le nombre d'effets.
 */
test.describe.serial('Archivage automatique d’un évènement', () => {
	const kept = useEvent('Garde')
	const forgotten = useEvent('Oubli')
	let page: Page

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
	})
	test.afterAll(async () => {
		await page.close()
		await prisma.$disconnect()
	})

	async function runEventArchive() {
		await gotoHydrated(page, '/root/tasks')
		const row = page.getByRole('row').filter({ hasText: 'event-archive' })
		await row.getByRole('button', { name: 'Exécuter' }).click()
		await expect(page.getByText(/event-archive: \d+ effet/)).toBeVisible()
	}

	/** Publié, fini depuis 40 jours, et son journal reculé d'autant: plus aucun signe de vie. */
	async function age(eventId: string) {
		const past = daysAgo(40)
		await prisma.event.update({
			where: { id: eventId },
			data: { state: 'published', startDate: past, endDate: past, createdAt: past },
		})
		await prisma.log.updateMany({ where: { eventId }, data: { createdAt: past } })
	}

	async function expectNotice(eventId: string, visible: boolean) {
		await gotoHydrated(page, `/${eventId}/admin/settings`)
		const notice = page.getByText("Faute d'activité, l'évènement sera archivé automatiquement")
		await (visible ? expect(notice).toBeVisible() : expect(notice).toBeHidden())
	}

	test('Préparation: deux évènements publiés et oubliés', async () => {
		// `/root/tasks` n'est ouvert qu'à `ROOT_USER`, dont `playwright.config.ts` fixe l'adresse.
		await signIn(page, await seedUser('Root', { email: 'root@benevio.test' }))
		await kept.create(page)
		await forgotten.create(page)
		await age(kept.eventId)
		await age(forgotten.eventId)
	})

	test("L'avertissement précède l'archivage", async () => {
		await runEventArchive()
		await expectNotice(forgotten.eventId, true)

		// Un second passage dans le délai de grâce ne fait rien de plus.
		await runEventArchive()
		const event = await prisma.event.findUniqueOrThrow({ where: { id: forgotten.eventId } })
		expect(event.state).toBe('published')
	})

	test('« Garder ouvert » annule l’archivage', async () => {
		await expectNotice(kept.eventId, true)
		await page.getByRole('button', { name: 'Garder ouvert' }).click()
		await expect(page.getByText('Évènement gardé ouvert')).toBeVisible()
		await expectNotice(kept.eventId, false)
	})

	test("Sans réaction, l'évènement est archivé et le journal le dit", async () => {
		await prisma.event.update({
			where: { id: forgotten.eventId },
			data: { archiveNoticeAt: daysAgo(15) },
		})
		await runEventArchive()

		const states = await prisma.event.findMany({
			where: { id: { in: [kept.eventId, forgotten.eventId] } },
			select: { id: true, state: true },
		})
		expect(states.find((e) => e.id === forgotten.eventId)?.state).toBe('archived')
		expect(states.find((e) => e.id === kept.eventId)?.state).toBe('published')

		await gotoHydrated(page, `/${forgotten.eventId}/admin/dashboard`)
		const entries = page.locator('#journal').getByRole('listitem')
		await expect(
			entries.filter({ hasText: "Faute d'activité, l'évènement a été archivé automatiquement" })
		).toHaveCount(1)
	})
})
