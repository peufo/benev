import { expect, type Page } from '@playwright/test'
import type { User } from './user'
import cuid from '@paralleldrive/cuid2'

export function useEvent(owner: User, name: string) {
	const eventCuid = cuid.createId()
	const eventName = `Test event ${eventCuid}`
	const eventUrl = `test-event-${eventCuid}`

	return {
		async create(page: Page) {
			await owner.login(page)
			await page.getByRole('button', { name: 'Organiser' }).click()
			await page.getByRole('button', { name: 'Oui, je le veux' }).click()
			await page.waitForResponse(/.*\?\/.+/)
			await page.waitForTimeout(300)
			await page.getByLabel("Nom de l'évènement").fill(eventName)
			await expect(page.getByLabel("URL de l'évènement")).toHaveValue(eventUrl)
			await page.getByRole('button', { name: 'Valider' }).nth(2).click()
			await page.waitForResponse(/.*\?\/.+/)
			await expect(page).toHaveTitle(`Benev.io - ${eventName}`)
		},
		async gotoAsOwner(page: Page) {
			await owner.login(page)
			await page.goto(eventUrl)
			await expect(page).toHaveTitle(`Benev.io - ${eventName}`)
		},
	}
}

export type BenevEvent = ReturnType<typeof useEvent>
