import { expect, test } from '@playwright/test'
import { useEvent } from './event'
import { prisma, seedPeriod, seedTeam, seedUser, signIn } from './seed'
import { awaitHydrated, gotoHydrated } from './hydrated'
import { sharedPage } from './sharedPage'

test.describe.serial('Secteurs et responsables', () => {
	const event = useEvent('Secteurs')
	const page = sharedPage()

	test('Préparation: un évènement', async () => {
		await signIn(page, await seedUser('Barney'))
		await event.create(page)
	})

	/**
	 * L'état d'un `form()` distant vit dans son module et survit au démontage du formulaire:
	 * sans une instance par secteur, ce qui a été saisi sur l'un se retrouve sur le suivant,
	 * par-dessus ses vraies valeurs. Voir AGENTS.md, « L'état d'un formulaire vit dans son
	 * module ». La barre de sauvegarde ferme la première porte, en refusant de quitter un
	 * secteur modifié, et l'instance par secteur la seconde, une fois la saisie abandonnée.
	 *
	 * Crée « Alpha » et « Bravo », que les étapes suivantes lisent.
	 */
	test("Le formulaire de secteur repart de l'enregistrement ouvert", async () => {
		const newTeamLink = page.locator('a[href*="form_team=%7B%7D"]')
		const newDrawer = page.getByRole('dialog', { name: 'Nouveau secteur' })
		// Le tiroir de création s'ouvre par-dessus le formulaire de la page: les deux portent les
		// mêmes libellés, et chaque locator doit dire duquel il parle.
		const pageForm = page.locator('#team')
		const name = pageForm.getByLabel('Nom du secteur')
		// `InputBoolean` réduit la vraie case à `w-0`: on clique le libellé qui l'enveloppe,
		// et on lit l'état sur la case qu'il contient.
		const overflow = pageForm.locator('label').filter({ hasText: "Mode liste d'attente" })
		const saveBar = page.getByText('Modification en cours !')
		// La ligne du volet gauche porte le nom du secteur suivi de sa jauge: le nom seul suffit
		// à la désigner, l'ordre de la liste ne décidant de rien.
		const teamLink = (teamName: string) =>
			page.locator('aside').getByRole('link', { name: teamName })

		const createTeam = async (teamName: string) => {
			await newTeamLink.first().click()
			await expect(newDrawer).toBeVisible()
			const newName = newDrawer.getByLabel('Nom du secteur')
			// Le secteur précédemment créé ne doit pas prégarnir le suivant.
			await expect(newName).toHaveValue('')
			// Le tiroir pose le focus sur son premier champ de saisie: on tape sans cliquer.
			await expect(newName).toBeFocused()
			await newName.fill(teamName)
			await expect(newName).toHaveValue(teamName)
			await newDrawer.getByRole('button', { name: 'Valider', exact: true }).click()
			// La création referme le tiroir et ouvre le secteur.
			await expect(newDrawer).toBeHidden()
			await expect(name).toHaveValue(teamName)
		}

		await gotoHydrated(page, `/${event.eventId}/admin/teams`)

		await createTeam('Alpha')
		await createTeam('Bravo')

		await teamLink('Alpha').click()
		await expect(name).toHaveValue('Alpha')
		await expect(saveBar).toBeHidden()
		await expect(overflow.locator('input')).not.toBeChecked()
		await overflow.click()
		await expect(overflow.locator('input')).toBeChecked()
		await name.fill('Alpha modifié mais pas validé')
		await expect(saveBar).toBeVisible()

		// La barre retient le départ: le volet de gauche ne quitte pas un secteur dont la
		// saisie n'est pas tranchée.
		await teamLink('Bravo').click()
		await expect(name).toHaveValue('Alpha modifié mais pas validé')

		// Réinitialiser rend le formulaire à l'enregistrement, et rouvre le passage.
		await page.getByRole('button', { name: 'Réinitialiser' }).click()
		await expect(saveBar).toBeHidden()
		await expect(name).toHaveValue('Alpha')
		await expect(overflow.locator('input')).not.toBeChecked()

		// Bravo: le volet affiche Bravo, pas la saisie abandonnée sur Alpha.
		await teamLink('Bravo').click()
		await expect(name).toHaveValue('Bravo')
		await expect(overflow.locator('input')).not.toBeChecked()

		// Et l'abandon n'a rien enregistré non plus: revenir sur Alpha le repart du serveur.
		await teamLink('Alpha').click()
		await expect(name).toHaveValue('Alpha')
		await expect(overflow.locator('input')).not.toBeChecked()
	})

	/**
	 * Le membre créé par le tiroir est écrit dans le champ par son appelant, sans passer par
	 * la liste: la barre de sauvegarde ne le voit que si le select annonce toute valeur, d'où
	 * qu'elle vienne.
	 */
	test('Un responsable invité depuis le secteur ouvre la barre de sauvegarde', async () => {
		await gotoHydrated(page, `/${event.eventId}/admin/teams`)
		await page.locator('aside').getByRole('link', { name: 'Alpha' }).click()

		const combobox = page.getByRole('combobox', { name: 'Responsables' })
		const inviteLink = page.locator('a[href*="form_invite=%7B%7D"]')
		// Le lien vit dans le popover du champ, et non dans le formulaire.
		await combobox.click()
		await expect(inviteLink).toBeVisible()
		await inviteLink.click()

		const dialog = page.getByRole('dialog', { name: 'Inviter un nouveau membre' })
		await dialog.getByLabel('Prénom').fill('Gordon')
		// `exact`: « Prénom » contient « nom ».
		await dialog.getByLabel('Nom', { exact: true }).fill('Freeman')
		// Appelé depuis un secteur, le tiroir cache le champ qui rouvrirait celui d'où l'on vient.
		await expect(dialog.getByText('Responsable des secteurs')).toBeHidden()
		await dialog.getByRole('button', { name: 'Valider' }).click()
		await expect(dialog).toBeHidden()

		const saveBar = page.getByText('Modification en cours !')
		await expect(combobox.getByText('Gordon Freeman')).toBeVisible()
		await expect(saveBar).toBeVisible()

		await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
		await expect(saveBar).toBeHidden()

		// Rechargée, la puce ne tient plus qu'à ce que la soumission a écrit.
		await page.reload()
		await awaitHydrated(page)
		await expect(combobox.getByText('Gordon Freeman')).toBeVisible()
	})

	/**
	 * Le seul geste qui nomme un responsable hors du secteur. La relation est écrite avec le
	 * membre, et le journal en fige les noms: le fil se rend sans jointure, et `teamId` ne
	 * pourrait de toute façon en désigner qu'un.
	 */
	test("L'invitation confie des secteurs dès la création du membre", async () => {
		await gotoHydrated(page, `/${event.eventId}/admin/members?form_invite=1`)
		const dialog = page.getByRole('dialog')
		await dialog.getByLabel('Prénom').fill('Alyx')
		// `exact`: « Prénom » contient « nom ».
		await dialog.getByLabel('Nom', { exact: true }).fill('Vance')

		// Le combobox tient ses secteurs d'une remote query: la proposition attend sa réponse.
		const combobox = dialog.getByRole('combobox', { name: 'Responsable des secteurs' })
		const option = dialog.getByRole('option', { name: 'Alpha', exact: true })
		await combobox.click()
		await expect(option).toBeVisible()
		await option.click()

		// Le popover reste ouvert: il recouvre le formulaire, mais pas le pied du tiroir.
		await dialog.getByRole('button', { name: 'Valider' }).click()
		// Sans adresse, il n'y a rien à envoyer: le libellé du succès le dit.
		await expect(page.getByText('Membre ajouté')).toBeVisible()

		await gotoHydrated(page, `/${event.eventId}/admin/members`)
		await page
			.getByRole('link', { name: /Alyx Vance/ })
			.first()
			.click()
		await expect(page.getByRole('heading', { name: 'Alyx Vance' })).toBeVisible()
		// Le rôle se dérive de la relation: le badge dit qu'elle a bien été écrite.
		await expect(page.getByText('Responsable', { exact: true })).toBeVisible()

		const journal = page.locator('#journal').getByRole('listitem')
		await expect(
			journal.filter({ hasText: 'a invité Alyx Vance' }).filter({ hasText: 'Alpha' })
		).toHaveCount(1)
	})

	/**
	 * Le rôle donné dès l'invitation: la case n'est rendue qu'aux administrateurs, et rien
	 * d'autre ne prouve qu'elle atteint bien la colonne `isAdmin` du membre créé. Une fiche à
	 * elle seule ne peut pas le prouver en même temps que le rôle de responsable: un membre ne
	 * porte que son rôle le plus haut.
	 *
	 * En dernier, pour la même raison: les badges de rôle des étapes précédentes ne s'attendent
	 * pas à croiser cet administrateur.
	 */
	test("L'invitation nomme un administrateur dès la création du membre", async () => {
		await gotoHydrated(page, `/${event.eventId}/admin/members?form_invite=1`)
		const dialog = page.getByRole('dialog')
		await dialog.getByLabel('Prénom').fill('Wallace')
		// `exact`: « Prénom » contient « nom ».
		await dialog.getByLabel('Nom', { exact: true }).fill('Breen')

		// La case est réduite à zéro pixel: c'est son libellé qui la bascule.
		const isAdmin = page.getByRole('checkbox', { name: /Nommer administrateur/ })
		await dialog.getByText('Nommer administrateur·ice').click()
		await expect(isAdmin).toBeChecked()

		await dialog.getByRole('button', { name: 'Valider' }).click()
		await expect(page.getByText('Membre ajouté')).toBeVisible()

		await gotoHydrated(page, `/${event.eventId}/admin/members`)
		await page
			.getByRole('link', { name: /Wallace Breen/ })
			.first()
			.click()
		await expect(page.getByRole('heading', { name: 'Wallace Breen' })).toBeVisible()
		await expect(page.getByText('Administrateur·ice', { exact: true })).toBeVisible()

		const journal = page.locator('#journal').getByRole('listitem')
		await expect(
			journal
				.filter({ hasText: 'a invité Wallace Breen' })
				.filter({ hasText: 'administrateur·ice' })
		).toHaveCount(1)
	})

	/** L'aperçu du tiroir et ce que le serveur écrit doivent tomber sur le même jour. */
	test('Dupliquer un secteur décale ses créneaux du nombre de jours choisi', async () => {
		const team = await seedTeam(event.eventId, 'Vendredi')
		// Un vendredi, à une heure qui le reste dans tous les fuseaux d'Europe.
		const period = await seedPeriod(team.id, { at: new Date('2030-06-14T08:00:00Z') })
		await gotoHydrated(page, `/${event.eventId}/admin/teams/${team.id}`)

		await page.getByRole('button', { name: 'Dupliquer', exact: true }).click()
		const drawer = page.getByRole('dialog', { name: 'Dupliquer « Vendredi »' })
		await expect(drawer).toBeVisible()
		await expect(drawer.getByText(/^samedi/)).toBeVisible()

		await drawer.getByLabel('Décalage des dates, en jours').fill('2')
		await expect(drawer.getByText(/^dimanche/)).toBeVisible()
		await drawer.getByRole('button', { name: 'Dupliquer le secteur' }).click()

		await expect(drawer).toBeHidden()
		await expect(page.locator('#team').getByLabel('Nom du secteur')).toHaveValue('Vendredi copie')
		const clone = await prisma.team.findFirstOrThrow({
			where: { eventId: event.eventId, name: 'Vendredi copie' },
			include: { periods: true },
		})
		const DAY = 1000 * 60 * 60 * 24
		expect(clone.periods.map((p) => p.start.getTime())).toEqual([period.start.getTime() + 2 * DAY])
	})
})
