import { describe, it } from 'vitest'
import { render } from 'svelte/server'
import EmailPeriodReminder from '#lib/email/EmailPeriodReminder.svelte'

const props = {
	member: { firstName: 'Marc' },
	event: { id: 'fete', name: 'Fête du village', timezone: 'Europe/Zurich', location: null },
	teamName: 'Buvette',
	period: { start: new Date('2026-07-04T08:00:00Z'), end: new Date('2026-07-04T12:00:00Z') },
}

describe('EmailPeriodReminder', () => {
	it("rappelle le secteur et l'horaire, dans le fuseau de l'évènement", ({ expect }) => {
		const { body } = render(EmailPeriodReminder, { props })
		expect(body).toContain('Marc')
		expect(body).toContain('Buvette')
		expect(body).toContain('10:00')
		expect(body).toContain('/fete/me')
		expect(body).not.toContain('—')
	})

	it("donne le lieu de l'évènement quand il en a un", ({ expect }) => {
		const location = { label: 'Place du Marché, Moutier', coords: { lat: 47.28, lon: 7.37 } }
		const { body } = render(EmailPeriodReminder, {
			props: { ...props, event: { ...props.event, location } },
		})
		expect(body).toContain('Place du Marché, Moutier')
		expect(body).toContain('google.com/maps')
	})
})
