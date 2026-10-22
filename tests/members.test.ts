import { expect, test } from '@playwright/test'
import { useEvent } from './event'
import { seedField, seedUser, signIn, verifyEmail, type SeededUser } from './seed'
import { awaitHydrated, gotoHydrated } from './hydrated'
import { sharedPage } from './sharedPage'

test.describe.serial('Membres et invitations', () => {
	const event = useEvent('Membres')
	let owner: SeededUser
	const page = sharedPage()

	test('Préparation: un évènement', async () => {
		owner = await seedUser('Bob')
		await signIn(page, owner)
		await event.create(page)
	})

	/**
	 * Le tiroir de champ de profil. Le type pilote les blocs conditionnels, et les trois
	 * cases sont couplées: « modifiable » et « obligatoire » supposent « visible », et
	 * retirer la visibilité retire les deux autres. Chaque case repilotée l'est par le champ
	 * distant, pas par le DOM: seul un aller-retour complet prouve que son état part au
	 * serveur. Lier `undefined` à l'éditeur d'options levait par ailleurs dans un effet de
	 * rendu, ce qui figeait le formulaire entier — le type choisi n'ouvrait plus aucun bloc.
	 */
	test('Le formulaire de champ de profil suit le type et les droits', async () => {
		const drawer = page.getByRole('dialog', { name: 'Nouveau champ' })
		const typeTrigger = page.getByRole('button', { name: 'Type de champ' })
		// `InputBoolean` réduit la vraie case à `w-0`: on clique le libellé qui l'enveloppe,
		// et on lit l'état sur la case qu'il contient.
		const booleanField = (label: string) => page.locator('label').filter({ hasText: label })
		const canRead = booleanField('Visible par les membres')
		const canWrite = booleanField('Modifiable par les membres')
		const required = booleanField('Valeur obligatoire')
		const formLabel = page.getByLabel('Question du formulaire')
		const newOption = page.getByPlaceholder('Nouvelle option')

		const selectType = async (label: string) => {
			if (!(await typeTrigger.textContent())?.includes(label)) {
				await typeTrigger.click()
				await page.getByRole('option', { name: label, exact: true }).click()
			}
			await expect(typeTrigger).toContainText(label)
		}

		await gotoHydrated(page, `/${event.eventId}/admin/settings?form_field=%7B%7D`)
		await expect(drawer).toBeVisible()
		// Le premier champ est une liste: le tiroir garde le focus plutôt que d'armer son
		// déclencheur.
		await expect(drawer).toBeFocused()

		// Une valeur à choisir dans une liste n'a rien d'obligatoire à remplir: le type ouvre
		// l'éditeur d'options et referme la case.
		await selectType('Liste à choix multiple')
		await expect(newOption).toBeVisible()
		await expect(required).toBeHidden()
		await selectType('Text')
		await expect(newOption).toBeHidden()

		await page.getByLabel('Nom', { exact: true }).fill('Ville')
		await expect(canRead.locator('input')).not.toBeChecked()
		// La question ne se pose qu'à un membre qui peut répondre.
		await expect(formLabel).toBeHidden()

		await canWrite.click()
		await expect(canRead.locator('input')).toBeChecked()
		await expect(canWrite.locator('input')).toBeChecked()
		await expect(formLabel).toBeVisible()

		await expect(required).toBeVisible()
		await required.click()
		await expect(required.locator('input')).toBeChecked()

		// Retirer la visibilité retire tout le reste: un champ caché ne se modifie ni ne s'exige.
		await canRead.click()
		await expect(canWrite.locator('input')).not.toBeChecked()
		await expect(required.locator('input')).not.toBeChecked()

		// Et l'exiger rétablit les deux droits.
		await required.click()
		await expect(canRead.locator('input')).toBeChecked()
		await expect(canWrite.locator('input')).toBeChecked()

		await page.getByRole('button', { name: 'Valider', exact: true }).last().click()
		await expect(drawer).toBeHidden()

		// Réouverture: les trois cases sont restituées. C'est ce qui ne partait pas au serveur.
		await page.getByRole('button', { name: /Ville/ }).click()
		await expect(page.getByRole('dialog', { name: 'Modifier le champ' })).toBeVisible()
		await expect(canRead.locator('input')).toBeChecked()
		await expect(canWrite.locator('input')).toBeChecked()
		await expect(required.locator('input')).toBeChecked()

		// Et le retour à faux, que rien ne transmettait: une case décochée n'envoie rien, c'est
		// `InputBoolean` qui pose le relais.
		await required.click()
		await expect(required.locator('input')).not.toBeChecked()
		await page.getByRole('button', { name: 'Valider', exact: true }).last().click()
		await expect(page.getByRole('dialog', { name: 'Modifier le champ' })).toBeHidden()

		await page.getByRole('button', { name: /Ville/ }).click()
		await expect(page.getByRole('dialog', { name: 'Modifier le champ' })).toBeVisible()
		await expect(required.locator('input')).not.toBeChecked()
	})

	/**
	 * Le profil d'un membre s'édite là où il s'affiche: plus de tiroir, des champs à choix
	 * rendus en listes déroulantes, et la barre de sauvegarde pour valider. La liste
	 * déroulante est le cas fragile — sa sélection vit dans le composant, que ni le
	 * `reset()` natif ni l'arrivée de nouvelles données ne restaurent: seul son remontage
	 * la ramène sur la valeur enregistrée.
	 *
	 * Après le champ « Ville », que la fiche édite.
	 */
	test("Le profil du membre s'édite sur sa fiche, par la barre de sauvegarde", async () => {
		const saveBar = page.getByText('Modification en cours !')
		const drawer = page.getByRole('dialog', { name: 'Nouveau champ' })
		const typeTrigger = page.getByRole('button', { name: 'Type de champ' })

		// Les deux formes de champ à choix, seul moyen d'éprouver les listes déroulantes du
		// mode compact. Elles sont semées: le tiroir qui les définit a sa propre étape.
		await seedField(event.eventId, {
			name: 'Repas',
			type: 'select',
			options: ['Omnivore', 'Végétarien'],
		})
		await seedField(event.eventId, {
			name: 'Allergies',
			type: 'multiselect',
			options: ['Gluten', 'Arachide'],
		})

		// La table renvoie sur la fiche du membre; le tiroir de profil n'existe plus.
		await gotoHydrated(page, `/${event.eventId}/admin/members`)
		await expect(page.getByRole('dialog', { name: /Modifier le profil/ })).toHaveCount(0)
		await page
			.getByRole('link', { name: /Bob The Tester/ })
			.first()
			.click()

		const city = page.getByLabel('Ville')
		const meal = page.getByRole('button', { name: 'Repas' })
		const allergies = page.getByRole('combobox', { name: 'Allergies' })
		await expect(page.getByRole('heading', { name: 'Bob The Tester' })).toBeVisible()
		await expect(meal).toBeVisible()
		await expect(saveBar).toBeHidden()

		await city.fill('Genève')
		await expect(saveBar).toBeVisible()
		await page.getByRole('button', { name: 'Réinitialiser' }).click()
		await expect(saveBar).toBeHidden()
		await expect(city).toHaveValue('')

		await city.fill('Genève')
		await meal.click()
		await page.getByRole('option', { name: 'Omnivore', exact: true }).click()
		await expect(meal).toContainText('Omnivore')
		await expect(saveBar).toBeVisible()

		await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
		await expect(page.getByText('Profil enregistré')).toBeVisible()
		await expect(saveBar).toBeHidden()

		await page.reload()
		await awaitHydrated(page)
		await expect(city).toHaveValue('Genève')
		await expect(meal).toContainText('Omnivore')
		await expect(saveBar).toBeHidden()

		// Un choix multiple n'émet aucun évènement de formulaire et ne referme pas son
		// popover: rien ne rend la main au déclencheur, comme le fait le select simple.
		// Sans annonce de sa part, la barre ne verrait ce premier choix qu'au second.
		await allergies.click()
		await page.getByRole('option', { name: 'Gluten', exact: true }).click()
		await expect(allergies).toContainText('Gluten')
		await expect(saveBar).toBeVisible()
		await page.keyboard.press('Escape')

		// Les sélections abandonnées reviennent aux valeurs enregistrées: c'est ce que le
		// `reset()` natif, seul, laisserait sur les derniers choix.
		await meal.click()
		await page.getByRole('option', { name: 'Végétarien', exact: true }).click()
		await expect(meal).toContainText('Végétarien')
		await page.getByRole('button', { name: 'Réinitialiser' }).click()
		await expect(saveBar).toBeHidden()
		await expect(meal).toContainText('Omnivore')
		await expect(allergies).not.toContainText('Gluten')

		// Un champ se définit depuis la fiche elle-même. Il rejoint le formulaire sans
		// ouvrir la barre: rien n'y a été saisi, et la ligne de base doit le prendre en
		// compte plutôt que le lire comme une modification.
		await page.getByRole('link', { name: 'Ajouter un champ au profil' }).click()
		await expect(drawer).toBeVisible()
		if ((await typeTrigger.textContent()) !== 'Text') {
			await typeTrigger.click()
			await page.getByRole('option', { name: 'Text', exact: true }).click()
		}
		await expect(typeTrigger).toContainText('Text')
		await drawer.getByLabel('Nom', { exact: true }).fill('Surnom')
		await drawer.locator('label').filter({ hasText: 'Modifiable par les membres' }).click()
		await drawer.getByRole('button', { name: 'Valider', exact: true }).click()
		await expect(drawer).toBeHidden()

		const nickname = page.getByLabel('Surnom')
		await expect(nickname).toBeVisible()
		await expect(saveBar).toBeHidden()

		await nickname.fill('Bobby')
		await expect(saveBar).toBeVisible()
		await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
		await expect(page.getByText('Profil enregistré')).toBeVisible()
		await expect(saveBar).toBeHidden()

		await page.reload()
		await awaitHydrated(page)
		await expect(page.getByLabel('Surnom')).toHaveValue('Bobby')
		await expect(saveBar).toBeHidden()
	})

	/**
	 * Le formulaire d'invitation reconnaît un compte déjà ouvert et pré-remplit son nom.
	 * La recherche passe par une remote query dont l'échec resterait silencieux.
	 */
	test("L'invitation reconnaît un compte existant", async () => {
		await gotoHydrated(page, `/${event.eventId}/admin/members?form_invite=1`)
		const dialog = page.getByRole('dialog')
		// `exact`: la case « Envoyer l'invitation par email » porte le mot dans son libellé.
		const emailInput = dialog.getByLabel('Email (optionnel)', { exact: true })
		const sendEmail = page.getByRole('checkbox', { name: /Envoyer l'invitation/ })
		const draftWarning = page.getByText("L'évènement n'étant pas encore publié")

		// Sans adresse, il n'y a rien à envoyer: la case reste cochée mais hors service, et
		// l'avertissement ne porterait sur aucun envoi.
		await expect(sendEmail).toBeChecked()
		await expect(sendEmail).toBeDisabled()
		await expect(draftWarning).toBeHidden()

		await emailInput.fill(owner.email)
		await expect(page.getByText('Compte trouvé !')).toBeVisible({ timeout: 2000 })

		await expect(sendEmail).toBeEnabled()
		// L'évènement est encore en brouillon et l'invité n'a aucun rôle: l'invitation
		// partirait vers une annonce, et l'avertissement le dit.
		await expect(draftWarning).toBeVisible()

		// Nommé·e administrateur·ice, l'invité accède déjà à tout l'espace: l'avertissement
		// tombe. La case est réduite à zéro pixel — c'est son libellé qui la bascule.
		const isAdmin = page.getByRole('checkbox', { name: /Nommer administrateur/ })
		await dialog.getByText('Nommer administrateur·ice').click()
		await expect(isAdmin).toBeChecked()
		await expect(draftWarning).toBeHidden()

		await dialog.getByText('Nommer administrateur·ice').click()
		await expect(isAdmin).not.toBeChecked()
		await expect(draftWarning).toBeVisible()
	})

	/**
	 * `Member` porte un `@@unique([email, eventId])`: le doublon doit se dire sous le champ,
	 * là où l'erreur Prisma remonterait en 500 muet.
	 */
	test("L'invitation refuse une adresse déjà membre", async () => {
		await gotoHydrated(page, `/${event.eventId}/admin/members?form_invite=1`)
		const dialog = page.getByRole('dialog')
		await dialog.getByLabel('Prénom').fill('Doublon')
		// `exact`: « Prénom » contient « nom ».
		await dialog.getByLabel('Nom', { exact: true }).fill('Test')
		await dialog.getByLabel('Email (optionnel)', { exact: true }).fill(owner.email)
		await dialog.getByRole('button', { name: 'Valider' }).click()

		// Le contrôle préalable nomme le membre qui tient déjà l'adresse; la contrainte de la
		// base, elle, dirait « Cette adresse est déjà utilisée dans cet évènement ».
		await expect(dialog.getByText('Cette email est déjà associée à')).toBeVisible()
	})

	/**
	 * L'invitation se rejoue depuis la fiche — le cas de l'adresse corrigée après coup. Le
	 * journal du membre, filtré sur lui seul, porte les deux gestes et les distingue.
	 */
	test("L'invitation se renvoie depuis la fiche du membre", async () => {
		const email = `gordon-${event.eventId}@example.org`
		await gotoHydrated(page, `/${event.eventId}/admin/members?form_invite=1`)
		const dialog = page.getByRole('dialog')
		await dialog.getByLabel('Prénom').fill('Gordon')
		// `exact`: « Prénom » contient « nom ».
		await dialog.getByLabel('Nom', { exact: true }).fill('Freeman')

		// La case ne s'active qu'une fois l'adresse reconnue valide, côté client.
		const sendEmail = page.getByRole('checkbox', { name: /Envoyer l'invitation/ })
		await dialog.getByLabel('Email (optionnel)', { exact: true }).fill(email)
		await expect(sendEmail).toBeEnabled()
		await dialog.getByRole('button', { name: 'Valider' }).click()
		await expect(page.getByText('Invitation envoyée')).toBeVisible()

		await gotoHydrated(page, `/${event.eventId}/admin/members`)
		await page
			.getByRole('link', { name: /Gordon Freeman/ })
			.first()
			.click()
		await expect(page.getByRole('heading', { name: 'Gordon Freeman' })).toBeVisible()

		// Le geste écrit à un bénévole: le bouton fait relire l'adresse avant de partir.
		const resend = page.getByRole('button', { name: `Renvoyer l'invitation à ${email}` })
		await resend.click()
		await page.getByRole('dialog').getByRole('button', { name: 'Renvoyer' }).click()
		await expect(page.getByText('Invitation renvoyée')).toBeVisible()

		const journal = page.locator('#journal').getByRole('listitem')
		await expect(journal.filter({ hasText: 'a invité Gordon Freeman' })).toHaveCount(1)
		await expect(
			journal.filter({ hasText: 'a renvoyé une invitation à Gordon Freeman' })
		).toHaveCount(1)
	})

	/**
	 * Le refus d'une invitation, des deux côtés. À cette étape l'invité n'est relié à aucun
	 * membre: le bouton passait par `deleteMember`, que la permission refusait en 403 — il ne
	 * se passait rien. Ce qu'il retire, c'est son adresse, la fiche appartenant à l'évènement
	 * qui l'a créée.
	 */
	test("Un invité refuse l'invitation et son adresse quitte la fiche", async ({
		browser: invitedBrowser,
	}) => {
		// Le compte existe avant l'invitation: c'est le cas ordinaire, et le tunnel rattache
		// alors le membre par son adresse, une fois celle-ci prouvée.
		const chell = await seedUser('Chell', { isEmailVerified: false })
		const invitedPage = await invitedBrowser.newPage()
		try {
			await signIn(invitedPage, chell)
			await gotoHydrated(page, `/${event.eventId}/admin/members?form_invite=1`)
			const dialog = page.getByRole('dialog')
			await dialog.getByLabel('Prénom').fill('Chell')
			// `exact`: « Prénom » contient « nom ».
			await dialog.getByLabel('Nom', { exact: true }).fill('Johnson')
			await dialog.getByLabel('Email (optionnel)', { exact: true }).fill(chell.email)
			await dialog.getByRole('button', { name: 'Valider' }).click()
			await expect(dialog).toBeHidden()

			const openMember = async () => {
				await gotoHydrated(page, `/${event.eventId}/admin/members`)
				await page
					.getByRole('link', { name: /Chell Johnson/ })
					.first()
					.click()
				await expect(page.getByRole('heading', { name: 'Chell Johnson' })).toBeVisible()
			}
			// Tant qu'une adresse est là, l'invitation peut être rejouée: c'est ce bouton, et lui
			// seul, que le refus fait disparaître.
			const resend = page.getByRole('button', { name: /Renvoyer l'invitation/ })
			await openMember()
			await expect(resend).toBeVisible()

			// Sans le jeton du mail, c'est la vérification de l'adresse qui donne accès à la fiche
			// invitée — refuser demande la même preuve qu'accepter.
			await verifyEmail(chell)
			await gotoHydrated(invitedPage, `/${event.eventId}/register`)
			const decline = invitedPage.getByRole('button', { name: /^(Refuser|Confirmer)$/ })
			await decline.click()
			// Hydratée, la page demande confirmation avant de soumettre; sans elle, la soumission
			// native du premier clic est déjà partie. Le second clic n'a lieu que dans le premier cas.
			if (await decline.isVisible().catch(() => false)) await decline.click()
			await invitedPage.waitForURL('**/me/events')

			await openMember()
			await expect(resend).toHaveCount(0)

			const journal = page.locator('#journal').getByRole('listitem')
			await expect(
				journal
					.filter({ hasText: "a refusé l'invitation de Chell Johnson" })
					.filter({ hasText: 'adresse retirée' })
			).toHaveCount(1)
		} finally {
			await invitedPage.close()
		}
	})
})
