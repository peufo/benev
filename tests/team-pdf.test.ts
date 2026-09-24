import { expect, test, type Page } from '@playwright/test'
import { useEvent } from './event'
import { prisma, seedMember, seedPeriod, seedTeam, seedUser, signIn } from './seed'
import { gotoHydrated } from './hydrated'

/**
 * Le PDF d'un secteur porte les téléphones de ses inscrit·es: ce qui se vérifie ici, c'est à qui
 * l'endpoint le rend. Son contenu, lui, se juge dans `teamSheet.test.ts`.
 */
test.describe.serial("PDF d'un secteur", () => {
	const event = useEvent('Feuille')
	const other = useEvent('Voisin')
	let page: Page
	let teamId: string
	let foreignTeamId: string

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
	})
	test.afterAll(async () => {
		await page.close()
	})

	test('Préparation: un secteur, un créneau, une inscription', async () => {
		await signIn(page, await seedUser('Boss'))
		await event.create(page)
		await other.create(page)

		const team = await seedTeam(event.eventId, 'Bar')
		teamId = team.id
		foreignTeamId = (await seedTeam(other.eventId, 'Caisse')).id

		const period = await seedPeriod(team.id)
		const volunteer = await seedMember(event.eventId, await seedUser('Vol'))
		await prisma.member.update({ where: { id: volunteer.id }, data: { phone: '079 123 45 67' } })
		await prisma.subscribe.create({
			data: { periodId: period.id, memberId: volunteer.id, state: 'accepted' },
		})
	})

	test('La page du secteur y mène, et le PDF sort', async () => {
		await gotoHydrated(page, `/${event.eventId}/admin/teams/${teamId}`)
		const link = page.locator(`a[href$="/admin/teams/${teamId}/pdf"]`)
		await expect(link).toHaveAttribute('target', '_blank')

		const res = await page.request.get(`/${event.eventId}/admin/teams/${teamId}/pdf`)
		expect(res.status()).toBe(200)
		expect(res.headers()['content-type']).toBe('application/pdf')
		expect((await res.body()).subarray(0, 5).toString()).toBe('%PDF-')
	})

	test("Le secteur d'un autre évènement ne se lit pas par cette adresse", async () => {
		const res = await page.request.get(`/${event.eventId}/admin/teams/${foreignTeamId}/pdf`)
		expect(res.status()).toBe(404)
	})

	test("Un membre sans rôle n'y a pas accès", async ({ browser }) => {
		const memberPage = await browser.newPage()
		const user = await seedUser('Simple')
		await seedMember(event.eventId, user)
		await signIn(memberPage, user)
		const res = await memberPage.request.get(`/${event.eventId}/admin/teams/${teamId}/pdf`)
		expect(res.status()).toBe(403)
		await memberPage.close()
	})
})
