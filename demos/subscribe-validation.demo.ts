import { demo, expect } from 'cademo'
import { prisma } from '../tests/seed'
import { createVolunteer, seedFestival } from './fixtures'
import { gotoHydrated } from '../tests/hydrated'

demo('subscribe-validation', async ({ page, director }) => {
	const { eventId, teams, fieldIds } = await seedFestival(page)
	// La demande que laisse la démo `subscribe`: Sophie, au bar le samedi soir.
	const sophie = await createVolunteer()
	const member = await prisma.member.create({
		data: {
			eventId,
			userId: sophie.id,
			firstName: sophie.firstName,
			lastName: sophie.lastName,
			email: sophie.email,
			isEmailVerified: true,
			isValidedByEvent: true,
			avatarPlaceholder: 'https://api.dicebear.com/7.x/thumbs/svg?seed=sophie',
			profileJson: { [fieldIds.diet!]: ['Végétarien'], [fieldIds.size!]: 'M' },
		},
	})
	const bar = teams.find((team) => team.name === 'Bar principal')!
	await prisma.subscribe.create({
		data: { periodId: bar.periods[3].id, memberId: member.id, state: 'request' },
	})
	await gotoHydrated(page, `/${eventId}/admin/dashboard`)

	await director.start()

	// Le tableau de bord entier d'abord: la demande arrive parmi les autres.
	await director.focus(null)
	await director.pause(1200)
	await director.focus('auto')

	const pending = page.getByRole('listitem')
	async function confirm(name: string, note?: string) {
		const state = pending.filter({ hasText: name }).last().getByRole('button').last()
		if (note) await director.note(state, note)
		await director.click(state)
		await director.click(page.getByRole('button', { name: 'Confirmer' }))
		await expect(journal.filter({ hasText: name })).toBeVisible()
	}
	const journal = page.locator('#journal').getByRole('listitem')

	await confirm('Sophie Rapin', 'Une nouvelle demande')
	await confirm('Clara Nicolet')

	// Chaque décision laisse sa trace au journal.
	await director.focus(journal.filter({ hasText: 'Sophie Rapin' }), { scale: 1.6 })
	await director.pause(2000)
})
