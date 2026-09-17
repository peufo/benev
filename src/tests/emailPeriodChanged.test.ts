import { describe, it } from 'vitest'
import { render } from 'svelte/server'
import EmailPeriodChanged from '$lib/email/EmailPeriodChanged.svelte'

/**
 * Le courriel se rend au serveur, sans `page.data`: le fuseau doit lui arriver en prop. Les deux
 * variantes, changement et suppression, tiennent dans le même composant.
 */
const props = {
	member: { firstName: 'Marc' },
	event: { id: 'fete', name: 'Fête du village', timezone: 'Europe/Zurich' },
	teamName: 'Buvette',
	before: { start: new Date('2026-07-04T08:00:00Z'), end: new Date('2026-07-04T12:00:00Z') },
}

describe('EmailPeriodChanged', () => {
	it("annonce l'ancien et le nouvel horaire", ({ expect }) => {
		const after = { start: new Date('2026-07-04T09:00:00Z'), end: new Date('2026-07-04T13:00:00Z') }
		const { body } = render(EmailPeriodChanged, { props: { ...props, after } })
		expect(body).toContain('Marc')
		expect(body).toContain('Buvette')
		expect(body).toContain('Un créneau a changé')
		expect(body).toContain('10:00')
		expect(body).toContain('11:00')
		expect(body).toContain('/fete/me')
		expect(body).not.toContain('—')
	})

	it('annonce la suppression sans nouvel horaire', ({ expect }) => {
		const { body } = render(EmailPeriodChanged, { props: { ...props, after: null } })
		expect(body).toContain('Un créneau a été supprimé')
		expect(body).toContain('10:00')
		expect(body).not.toContain('Maintenant')
		expect(body).not.toContain('—')
	})
})
