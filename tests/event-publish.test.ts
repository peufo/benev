import { expect, test } from '@playwright/test'
import { useEvent } from './event'
import { prisma, seedPeriod, seedTeam, seedUser, signIn } from './seed'
import { gotoHydrated } from './hydrated'
import { sharedPage } from './sharedPage'

/**
 * Un évènement non publié n'écrit pas aux bénévoles qui ne pourraient pas y entrer: l'invitation
 * d'un membre sans rôle et la proposition d'un créneau attendent sa publication, qui les annonce
 * puis les envoie. Les envois étant coupés en E2E, ce sont les marqueurs en base qui en font foi.
 */
test.describe.serial("Ce qui part à la publication d'un évènement", () => {
	const event = useEvent('Publication')
	const page = sharedPage()
	const ada = { firstName: 'Ada', lastName: 'Lovelace' }
	const bob = { firstName: 'Bob', lastName: 'Morane' }

	const findMember = ({ firstName }: { firstName: string }) =>
		prisma.member.findFirstOrThrow({ where: { eventId: event.eventId, firstName } })

	async function invite({ firstName, lastName }: { firstName: string; lastName: string }) {
		await gotoHydrated(page, `/${event.eventId}/admin/members?form_invite=1`)
		const dialog = page.getByRole('dialog')
		await dialog.getByLabel('Prénom').fill(firstName)
		// `exact`: « Prénom » contient « nom ».
		await dialog.getByLabel('Nom', { exact: true }).fill(lastName)
		const email = `${firstName.toLowerCase()}-${event.eventId}@example.org`
		await dialog.getByLabel('Email (optionnel)', { exact: true }).fill(email)
		await expect(dialog.getByText("l'invitation partira à sa publication")).toBeVisible()
		await dialog.getByRole('button', { name: 'Valider' }).click()
		await expect(page.getByText('Membre ajouté, invitation à la publication')).toBeVisible()
	}

	test('Préparation: un évènement en brouillon, un secteur publié, un créneau', async () => {
		await signIn(page, await seedUser('Pub'))
		await event.create(page)
		const team = await seedTeam(event.eventId, 'Buvette', 'published')
		await seedPeriod(team.id)
	})

	test("En brouillon, l'invitation d'un membre sans rôle attend la publication", async () => {
		await invite(ada)
		expect((await findMember(ada)).invitePendingAt).not.toBeNull()

		await gotoHydrated(page, `/${event.eventId}/admin/members`)
		await page
			.getByRole('link', { name: /Ada Lovelace/ })
			.first()
			.click()
		await expect(page.getByRole('heading', { name: 'Ada Lovelace' })).toBeVisible()
		await expect(page.getByText('Invitation en attente')).toBeVisible()
		await expect(
			page.locator('#journal').getByText('invitation à la publication').first()
		).toBeVisible()
	})

	test('La proposition de créneau attend elle aussi', async () => {
		const subscribes = page.locator('#subscibes')
		await subscribes.getByRole('button').first().click()
		const dialog = page
			.getByRole('dialog')
			.filter({ has: page.getByRole('heading', { name: 'Nouvelle inscription pour Ada' }) })
		await dialog.getByRole('menuitem', { name: /Buvette/ }).click()
		await dialog.getByRole('menuitem').first().click()
		await expect(page.getByText('Inscription créée')).toBeVisible()

		const subscribe = await prisma.subscribe.findFirstOrThrow({
			where: { memberId: (await findMember(ada)).id },
		})
		expect(subscribe.notifiedAt).toBeNull()
	})

	test('La publication annonce ce qui attendait, puis l’envoie', async () => {
		await gotoHydrated(page, `/${event.eventId}/admin/settings`)
		const sendInvites = page.getByRole('checkbox', { name: "Envoyer l'invitation en attente" })
		await expect(sendInvites).toBeChecked()

		await page.getByRole('button', { name: 'Publier', exact: true }).click()
		const confirmation = page.getByRole('dialog')
		await expect(confirmation).toContainText(
			"1 invitation et 1 demande d'inscription partiront par e-mail."
		)
		await confirmation.getByRole('button', { name: 'Publier' }).click()
		await expect(page.getByText('Évènement publié: 2 e-mails envoyés')).toBeVisible()

		const member = await findMember(ada)
		expect(member.invitePendingAt).toBeNull()
		const subscribe = await prisma.subscribe.findFirstOrThrow({ where: { memberId: member.id } })
		expect(subscribe.notifiedAt).not.toBeNull()

		await gotoHydrated(page, `/${event.eventId}/admin/dashboard`)
		const entry = page
			.locator('#journal')
			.getByRole('listitem')
			.filter({ hasText: "a changé le statut de l'évènement" })
			.last()
		await expect(entry).toContainText('1 invitation envoyée')
		await expect(entry).toContainText("1 demande d'inscription envoyée")
	})

	test('Republier ne renvoie rien, et décocher la case efface les invitations', async () => {
		const { notifiedAt } = await prisma.subscribe.findFirstOrThrow({
			where: { memberId: (await findMember(ada)).id },
		})

		await gotoHydrated(page, `/${event.eventId}/admin/settings`)
		await page.getByRole('button', { name: 'Repasser en brouillon' }).click()
		await expect(page.getByText('Évènement en construction').first()).toBeVisible()

		await invite(bob)

		await gotoHydrated(page, `/${event.eventId}/admin/settings`)
		const sendInvites = page.getByRole('checkbox', { name: "Envoyer l'invitation en attente" })
		await expect(sendInvites).toBeChecked()
		// `InputBoolean` réduit la vraie case à `w-0`: on clique le libellé qui l'enveloppe.
		await page.locator('label').filter({ hasText: "Envoyer l'invitation en attente" }).click()
		await expect(sendInvites).not.toBeChecked()

		// Plus rien à envoyer: la publication passe sans confirmation.
		await page.getByRole('button', { name: 'Publier', exact: true }).click()
		await expect(page.getByText('Évènement publié', { exact: true }).first()).toBeVisible()
		await expect(page.getByRole('dialog')).toBeHidden()

		expect((await findMember(bob)).invitePendingAt).toBeNull()
		const subscribe = await prisma.subscribe.findFirstOrThrow({
			where: { memberId: (await findMember(ada)).id },
		})
		expect(subscribe.notifiedAt).toEqual(notifiedAt)
	})
})
