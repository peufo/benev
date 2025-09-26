import type { BenevEvent } from './event'
import { expect, type Page } from '@playwright/test'

export function useMember(event: BenevEvent, name: string, email = '') {
	return {
		async create(page: Page) {
			await event.gotoAsOwner(page)
			await page.getByRole('link', { name: 'Membres', exact: true }).click()
			await page.getByRole('main').getByRole('link').filter({ hasText: /^$/ }).nth(1).click()
			await page.waitForResponse(/.*\?form_invite={}/)
			await page.getByRole('textbox', { name: 'Email' }).click()
			await page.getByRole('textbox', { name: 'Email' }).fill(email)
			await page.getByRole('textbox', { name: 'Prénom' }).click()
			await page.getByRole('textbox', { name: 'Prénom' }).fill(name)
			await page.getByRole('textbox', { name: 'Nom', exact: true }).fill('The Tester')
			await page.getByRole('textbox', { name: 'Nom', exact: true }).press('Enter')
			await page.waitForResponse(/.*\?\/.*/)
			await expect(page.locator('tbody')).toContainText(`${name} The Tester`)
		},
	}
}
