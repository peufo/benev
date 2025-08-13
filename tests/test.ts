import { expect, test } from '@playwright/test'
import cuid from '@paralleldrive/cuid2'
import { useUser } from './user'
import { useEvent } from './event'
import { useMember } from './member'

test('Open landing page', async ({ page }) => {
	await page.goto('/')
	await expect(page.getByRole('heading', { name: 'Benev.io' })).toBeVisible()
	await expect(page).toHaveTitle(/Benev\.io/)
})

test.describe('Bob and Alice journey', () => {
	const bob = useUser('Bob')
	const alice = useUser('Alice')
	const event = useEvent(bob, 'Aperture')
	const claude = useMember(event, 'Claude')
	const dylan = useMember(event, 'Dylan', 'dylan-the-tester@benev.io')

	test('Register Bob', async ({ page }) => {
		await bob.register(page)
		bob.expectConnected(page)
	})
	test('Register Alice', async ({ page }) => {
		await alice.register(page)
		alice.expectConnected(page)
	})
	test('Login Bob', async ({ page }) => {
		await bob.login(page)
		bob.expectConnected(page)
	})

	test('Create an event', async ({ page }) => {
		await event.create(page)
	})

	test('Create a members', async ({ page }) => {
		await claude.create(page)
	})
})
