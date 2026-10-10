import { demo, expect } from 'cademo'
import { seedCharter, seedFestival, seedVolunteer } from './fixtures'
import { gotoHydrated } from '../tests/hydrated'

demo('subscribe', async ({ page, director }) => {
	const { eventId } = await seedFestival(page)
	await seedCharter(eventId)
	await seedVolunteer(page)
	await gotoHydrated(page, `/${eventId}`)

	await director.start()

	// L'adhésion: la charte, puis les questions du festival.
	await director.click(page.getByRole('link', { name: 'Je veux devenir bénévole' }).first())
	const accept = page.getByRole('button', { name: 'Oui je le veux !' })
	await expect(accept).toBeVisible()
	await director.click(accept)
	await director.click(page.getByText('Végétarien', { exact: true }))
	await director.click(page.getByText('M', { exact: true }))
	await director.click(page.getByRole('button', { name: 'Valider' }))

	// Le choix d'un créneau, depuis son tableau de bord.
	await director.click(page.getByText('Voir les secteurs', { exact: true }))
	const bar = page.getByRole('link', { name: /^Bar principal/ })
	await director.click(bar.getByRole('heading', { name: 'Bar principal' }))
	const period = page.getByRole('button', { name: /^samedi, .* 21:00 — 01:00/ })
	await director.click(period)
	await director.click(page.getByRole('button', { name: 'Oui je le veux !' }))
	await expect(page.getByText('Un énorme merci')).toBeVisible()
	await director.pause(2500)
})
