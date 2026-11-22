import { expect, test } from '@playwright/test'
import { useEvent } from './event'
import { prisma, seedInvitedMember, seedPeriod, seedTeam, seedUser, signIn } from './seed'
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

	/**
	 * Les envois de la publication partent en arrière-plan, et sa ligne de journal prend leurs
	 * comptes quand ils ont fini: c'est elle qu'on attend avant de lire les marqueurs.
	 */
	const sent = (released: { invitations: number; requests: number }) =>
		expect
			.poll(async () => {
				const log = await prisma.log.findFirst({
					where: { eventId: event.eventId, type: 'event_state' },
					orderBy: { createdAt: 'desc' },
				})
				return log?.data
			})
			.toMatchObject({ released })

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
		const period = await seedPeriod(team.id)
		// Une proposition à un membre sans adresse n'a personne à qui partir: la publication ne
		// doit pas l'annoncer parmi ses e-mails.
		const unreachable = await seedInvitedMember(event.eventId, {
			firstName: 'Sans',
			lastName: 'Adresse',
		})
		await prisma.subscribe.create({
			data: {
				periodId: period.id,
				memberId: unreachable.id,
				state: 'request',
				createdBy: 'leader',
			},
		})
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

	/**
	 * Le tiroir ouvert depuis un secteur ne soumet aucun rôle: le membre n'en devient responsable
	 * qu'à l'enregistrement du secteur, et c'est ce geste qui envoie l'invitation retenue.
	 */
	test("Invité depuis un secteur, le responsable reçoit l'invitation à son enregistrement", async () => {
		const carla = { firstName: 'Carla', lastName: 'Bruni' }
		await gotoHydrated(page, `/${event.eventId}/admin/teams`)
		await page.locator('aside').getByRole('link', { name: 'Buvette' }).click()

		await page.getByRole('combobox', { name: 'Responsables' }).click()
		await page.locator('a[href*="form_invite=%7B%7D"]').click()
		const dialog = page.getByRole('dialog', { name: 'Inviter un nouveau membre' })
		await dialog.getByLabel('Prénom').fill(carla.firstName)
		// `exact`: « Prénom » contient « nom ».
		await dialog.getByLabel('Nom', { exact: true }).fill(carla.lastName)
		await dialog
			.getByLabel('Email (optionnel)', { exact: true })
			.fill(`carla-${event.eventId}@example.org`)
		await expect(
			dialog.getByText("l'invitation partira quand tu enregistreras le secteur")
		).toBeVisible()
		await dialog.getByRole('button', { name: 'Valider' }).click()
		await expect(
			page.getByText("Membre ajouté, invitation à l'enregistrement du secteur")
		).toBeVisible()
		expect((await findMember(carla)).invitePendingAt).not.toBeNull()

		const saveBar = page.getByText('Modification en cours !')
		await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
		await expect(saveBar).toBeHidden()
		expect((await findMember(carla)).invitePendingAt).toBeNull()
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
		await expect(page.getByText("Évènement publié: 2 e-mails en cours d'envoi")).toBeVisible()
		await sent({ invitations: 1, requests: 1 })

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

		// Le choix de ne pas inviter se lit au journal, qui sinon ressemblerait à une publication
		// où rien n'attendait.
		await gotoHydrated(page, `/${event.eventId}/admin/dashboard`)
		await expect(
			page
				.locator('#journal')
				.getByRole('listitem')
				.filter({ hasText: "a changé le statut de l'évènement" })
				.filter({ hasText: '1 invitation non envoyée' })
		).toBeVisible()
	})

	/**
	 * La case et la confirmation se fondent sur le compte lu à l'ouverture de la page: une
	 * invitation retenue depuis, par un import d'un autre onglet, n'a été proposée à personne.
	 */
	test("Une invitation retenue après l'ouverture de la page attend d'être proposée", async () => {
		await gotoHydrated(page, `/${event.eventId}/admin/settings`)
		await page.getByRole('button', { name: 'Repasser en brouillon' }).click()
		await expect(page.getByText('Évènement en construction').first()).toBeVisible()
		// Sans recharger: le formulaire apparu avec la transition doit être intercepté comme celui
		// du chargement, sans quoi il part en soumission native et saute la confirmation.
		const sendInvites = page.getByRole('checkbox', { name: "Envoyer l'invitation en attente" })
		await expect(sendInvites).toHaveCount(0)

		const late = { firstName: 'Tardif', lastName: 'Import' }
		const { id } = await seedInvitedMember(event.eventId, {
			...late,
			email: `tardif-${event.eventId}@example.org`,
		})
		await prisma.member.update({ where: { id }, data: { invitePendingAt: new Date() } })

		await page.getByRole('button', { name: 'Publier', exact: true }).click()
		await expect(page.getByText("D'autres invitations attendent")).toBeVisible()
		await expect(sendInvites).toBeChecked()
		const { state } = await prisma.event.findUniqueOrThrow({ where: { id: event.eventId } })
		expect(state).toBe('draft')
		expect((await findMember(late)).invitePendingAt).not.toBeNull()

		await page.getByRole('button', { name: 'Publier', exact: true }).click()
		const confirmation = page.getByRole('dialog')
		await expect(confirmation).toContainText('1 invitation partira par e-mail.')
		await confirmation.getByRole('button', { name: 'Publier' }).click()
		await expect(page.getByText("Évènement publié: 1 e-mail en cours d'envoi")).toBeVisible()
		await sent({ invitations: 1, requests: 0 })
		expect((await findMember(late)).invitePendingAt).toBeNull()
	})
})

/**
 * Le secteur qui quitte le brouillon relâche ses demandes destinataire par destinataire: dans un
 * évènement encore fermé, un membre qui a un rôle y entre déjà et reçoit la sienne, les autres
 * attendent la publication.
 */
test.describe.serial('Un secteur publié dans un évènement fermé', () => {
	const event = useEvent('SecteurFerme')
	const page = sharedPage()
	let leaderRequestId = ''
	let volunteerRequestId = ''

	test('Préparation: un secteur en brouillon, deux propositions', async () => {
		await signIn(page, await seedUser('Sect'))
		await event.create(page)
		const other = await seedTeam(event.eventId, 'Accueil', 'published')
		const team = await seedTeam(event.eventId, 'Cuisine')
		const period = await seedPeriod(team.id)
		const leader = await seedInvitedMember(event.eventId, {
			firstName: 'Lea',
			lastName: 'Der',
			email: `lea-${event.eventId}@example.org`,
			leaderOf: [other.id],
		})
		const volunteer = await seedInvitedMember(event.eventId, {
			firstName: 'Val',
			lastName: 'Bene',
			email: `val-${event.eventId}@example.org`,
		})
		const request = (memberId: string) =>
			prisma.subscribe.create({
				data: { periodId: period.id, memberId, state: 'request', createdBy: 'leader' },
			})
		leaderRequestId = (await request(leader.id)).id
		volunteerRequestId = (await request(volunteer.id)).id
	})

	test('Le responsable reçoit sa demande, le bénévole sans rôle attend', async () => {
		await gotoHydrated(page, `/${event.eventId}/admin/teams`)
		await page.locator('aside').getByRole('link', { name: 'Cuisine' }).click()
		await page.getByRole('button', { name: 'Brouillon', exact: true }).click()
		await page
			.getByRole('button', { name: /^Valider et (publier|ouvrir les inscriptions)$/ })
			.click()
		const confirmation = page.getByRole('dialog')
		await expect(confirmation).toContainText(
			'reçoit la sienne maintenant, les autres bénévoles à la publication'
		)
		await confirmation.getByRole('button', { name: 'Confirmer' }).click()
		await expect(page.getByText('Publié', { exact: true }).first()).toBeVisible()

		const notifiedAt = async (id: string) =>
			(await prisma.subscribe.findUniqueOrThrow({ where: { id } })).notifiedAt
		expect(await notifiedAt(leaderRequestId)).not.toBeNull()
		expect(await notifiedAt(volunteerRequestId)).toBeNull()
	})

	/** L'envoi d'une vie antérieure ne compte pas: la demande rétablie repart, ou attend. */
	test('Une proposition rétablie repart comme la première', async () => {
		const team = await prisma.team.findFirstOrThrow({
			where: { eventId: event.eventId, name: 'Accueil' },
		})
		const period = await seedPeriod(team.id)
		const leader = await seedInvitedMember(event.eventId, {
			firstName: 'Max',
			lastName: 'Retour',
			email: `max-${event.eventId}@example.org`,
			leaderOf: [team.id],
		})
		const previously = new Date('2020-01-01')
		const { id } = await prisma.subscribe.create({
			data: {
				periodId: period.id,
				memberId: leader.id,
				state: 'cancelled',
				createdBy: 'leader',
				notifiedAt: previously,
			},
		})

		await gotoHydrated(page, `/${event.eventId}/admin/members/${leader.id}`)
		const subscribes = page.locator('#subscibes')
		// Le premier bouton ajoute une inscription, le second porte l'état de la ligne.
		await subscribes.getByRole('button').nth(1).click()
		await page.getByRole('button', { name: 'Rétablir' }).click()
		await expect(page.getByText('Status changé')).toBeVisible()

		const subscribe = await prisma.subscribe.findUniqueOrThrow({ where: { id } })
		expect(subscribe.state).toBe('request')
		expect(subscribe.notifiedAt!.getTime()).toBeGreaterThan(previously.getTime())
	})
})
