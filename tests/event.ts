import { expect, type Page } from '@playwright/test'
import cuid from '@paralleldrive/cuid2'
import type { User } from './user'
import { mockPhoton, testPlace } from './photon'

/** Un aplat bleu de 64×64, de quoi nourrir la médiathèque sans fichier à versionner. */
const BLUE_SQUARE_PNG =
	'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAUElEQVR42u3PQQkAAAgEsEtjMeNbwgi+hcEKLNXzWgQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQErsACvwRBWjdZC+AAAAAASUVORK5CYII='

export function useEvent(owner: User, name: string) {
	const eventCuid = cuid.createId()
	const eventName = `${name} ${eventCuid}`
	const eventId = `${name.toLowerCase()}-${eventCuid}`

	return {
		eventId,
		eventName,
		async create(page: Page) {
			await mockPhoton(page)
			await page.goto('/me/events/create')

			// L'URL se dérive du nom par un `oninput`: tant que la page n'est pas hydratée, la
			// saisie ne déclenche rien. Rejouer le couple saisie/vérification attend l'hydratation
			// sans avoir à la deviner.
			await expect(async () => {
				await page.getByLabel("Nom de l'évènement").fill(eventName)
				await expect(page.getByLabel("URL de l'évènement")).toHaveValue(eventId, {
					timeout: 1000,
				})
			}).toPass()

			await page.getByRole('button', { name: 'Créer mon évènement' }).click()
			await page.waitForURL(`**/${eventId}`)
			await expect(page).toHaveTitle(new RegExp(eventName))
		},
		/**
		 * Une soumission refusée ne doit rien effacer. Le `<select>` est le cas fragile: sa valeur
		 * ne vit que dans la liaison de `InputSelectNative`, que le re-rendu du champ — celui que
		 * déclenche l'arrivée des erreurs — n'a aucune raison de rejouer.
		 */
		async expectInvalidSubmitKeepsFields(page: Page) {
			await page.goto('/me/events/create')
			const name = page.getByLabel("Nom de l'évènement")
			const url = page.getByLabel("URL de l'évènement")
			const timezone = page.getByLabel('Fuseau horaire')

			// Deux caractères: sous le minimum de trois du modèle, donc refusé par le serveur.
			await expect(async () => {
				await name.fill('ab')
				await expect(url).toHaveValue('ab', { timeout: 1000 })
			}).toPass()
			const zone = await timezone.inputValue()
			expect(zone).not.toBe('')

			await page.getByRole('button', { name: 'Créer mon évènement' }).click()
			await expect(page.getByText('Formulaire incorrect')).toBeVisible()
			await expect(name).toHaveValue('ab')
			await expect(url).toHaveValue('ab')
			await expect(timezone).toHaveValue(zone)
		},
		/**
		 * Le lieu ne se saisit plus à la création — celle-ci ne demande que l'essentiel — mais
		 * depuis les réglages. Il faut donc l'y poser avant de vérifier le pied de page.
		 */
		async setLocation(page: Page) {
			await mockPhoton(page)
			await page.goto(`/${eventId}/admin/settings`)
			// Le champ de recherche vit dans le popover d'`InputSelect`: il faut l'ouvrir d'abord.
			await page.getByLabel('Lieu', { exact: true }).click()
			await page.locator('input[placeholder="Recherche"]:visible').fill('salle des fetes')
			await page
				.locator('li, [role="option"]')
				.filter({ hasText: 'Salle des fêtes' })
				.first()
				.click()

			await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
			await expect(page.getByText('Modifications enregistrées')).toBeVisible()
		},
		async gotoPublic(page: Page) {
			await page.goto(`/${eventId}`)
			await expect(page).toHaveTitle(new RegExp(eventName))
		},
		/**
		 * Le lieu est stocké en Json (`Event.location`) puis rendu en pied de page.
		 * Un bug de sérialisation a déjà écrit un booléen dans cette colonne sans que
		 * rien ne le détecte: cette assertion ferme la porte.
		 */
		async expectLocationInFooter(page: Page) {
			const link = page.getByRole('link', { name: new RegExp(testPlace.label, 'i') })
			await expect(link).toBeVisible()
			await expect(link).toHaveAttribute(
				'href',
				`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
					`${testPlace.lat},${testPlace.lon}`
				)}`
			)
		},
		/**
		 * L'encodage des filtres de colonne est un contrat entre les `TableHead*` de fuma, qui
		 * l'écrivent dans l'URL, et les schémas de `$lib/models/filter`, qui le relisent. Rien
		 * ne relie les deux bouts: on constate ici qu'une URL filtrée passe bout en bout, là où
		 * `src/tests/filter.test.ts` ne vérifie que le schéma.
		 */
		async expectAdminFiltersAccepted(page: Page) {
			const cases: [string, string][] = [
				['members', 'subscribes_hours={"min":2,"max":8,"order":"asc"}'],
				['members', 'createdAt={"start":"2024-01-01T00:00:00.000Z","order":"desc"}'],
				['members', 'subscribes_teams=["a","b"]'],
				['members', 'isProfileComplet=true'],
				['members', 'age={"min":18}'],
				['subscribes', 'states=["accepted"]'],
				[
					'subscribes',
					'period={"start":"2024-01-01T00:00:00.000Z","end":"2025-01-01T00:00:00.000Z"}',
				],
				['subscribes', 'isAbsent=false'],
			]

			for (const [route, query] of cases) {
				const response = await page.goto(`/${eventId}/admin/${route}?${query}`)
				expect(response?.status(), `${route}?${query}`).toBeLessThan(400)
				// `ensureFieldsWithFilterAreVisibles` peut rediriger pour rendre la colonne
				// visible, mais le filtre lui-même doit survivre au passage.
				const key = query.split('=')[0]
				expect(new URL(page.url()).searchParams.has(key), `${route} garde ${key}`).toBe(true)
			}
		},
		/** Les trois anciennes pages de réglages sont devenues une seule, ancrée par section. */
		async expectSettingsRedirects(page: Page) {
			for (const [from, anchor] of [
				['event', 'essentials'],
				['theme', 'appearance'],
				['adhesion', 'membership'],
			]) {
				await page.goto(`/${eventId}/admin/${from}`)
				await expect(page).toHaveURL(`/${eventId}/admin/settings#${anchor}`)
			}
		},
		/**
		 * Le formulaire d'invitation reconnaît un compte déjà ouvert et pré-remplit son nom.
		 * La recherche passe par une remote query dont l'échec resterait silencieux.
		 */
		async expectInviteFindsExistingUser(page: Page, email: string) {
			await page.goto(`/${eventId}/admin/members?form_invite=1`)
			// `exact`: la case « Envoyer l'invitation par email » porte le mot dans son libellé.
			const emailInput = page.getByRole('dialog').getByLabel('Email (optionnel)', { exact: true })
			const sendEmail = page.getByRole('checkbox', { name: /Envoyer l'invitation/ })

			// Sans adresse, il n'y a rien à envoyer: la case reste cochée mais hors service.
			await expect(sendEmail).toBeChecked()
			await expect(sendEmail).toBeDisabled()
			// L'évènement est encore en brouillon: l'invité doit savoir ce qu'il y trouvera.
			await expect(page.getByText("L'évènement n'est pas publié")).toBeVisible()

			await expect(async () => {
				await emailInput.fill(email)
				await expect(page.getByText('Utilisateur trouvé !')).toBeVisible({ timeout: 2000 })
			}).toPass()

			await expect(sendEmail).toBeEnabled()
		},
		/**
		 * `Member` porte un `@@unique([email, eventId])`: le doublon doit se dire sous le champ,
		 * là où l'erreur Prisma remonterait en 500 muet.
		 */
		async expectInviteRejectsDuplicateEmail(page: Page, email: string) {
			await page.goto(`/${eventId}/admin/members?form_invite=1`)
			const dialog = page.getByRole('dialog')
			await dialog.getByLabel('Prénom').fill('Doublon')
			// `exact`: « Prénom » contient « nom ».
			await dialog.getByLabel('Nom', { exact: true }).fill('Test')
			await dialog.getByLabel('Email (optionnel)', { exact: true }).fill(email)
			await dialog.getByRole('button', { name: 'Valider' }).click()

			await expect(dialog.getByText('utilise déjà cette adresse')).toBeVisible()
		},
		/**
		 * Le journal se lit, se filtre, et accepte une note. Les lignes attendues ont été écrites
		 * par les étapes précédentes du parcours: c'est le tour complet écriture -> rendu, seul à
		 * pouvoir attraper une charge utile qui ne correspondrait plus à son composant.
		 */
		async expectJournal(page: Page) {
			await page.goto(`/${eventId}/admin/dashboard`)

			// Le fil tient dans une fenêtre: rien à charger avant, donc l'accueil et non le bouton.
			await expect(page.getByText('Début du journal')).toBeVisible()
			await expect(page.getByRole('button', { name: /entrées précédentes/ })).toHaveCount(0)

			// Les réglages modifiés plus haut, rendus par leur diff.
			await expect(page.getByText("a modifié les réglages de l'évènement").first()).toBeVisible()
			await expect(page.getByText('Lieu').first()).toBeVisible()

			// La note est la dernière chose arrivée: elle se pose en bas du fil.
			const note = `Rappeler le comité ${eventCuid}`
			await page.getByPlaceholder('Ajouter une note').fill(note)
			await page.getByRole('button', { name: 'Publier la note' }).click()
			const entries = page.getByRole('listitem')
			await expect(entries.last()).toContainText(note)

			// Le filtre par famille ne laisse que la note.
			await page.getByRole('link', { name: 'Notes' }).click()
			await expect(page.getByText(note)).toBeVisible()
			await expect(page.getByText("a modifié les réglages de l'évènement")).toHaveCount(0)

			await page.getByRole('button', { name: 'Supprimer la note' }).click()
			await expect(page.getByText(note)).toHaveCount(0)
		},
		/**
		 * Le fil se charge vers le passé. `take` est piloté par l'URL, ce qui permet de réduire la
		 * fenêtre à deux entrées au lieu d'en écrire trente pour atteindre le bouton.
		 */
		async expectJournalLoadsPrevious(page: Page) {
			await page.goto(`/${eventId}/admin/dashboard`)
			const notes = ['Alpha', 'Bravo', 'Charlie'].map((n) => `${n} ${eventCuid}`)
			for (const note of notes) {
				await page.getByPlaceholder('Ajouter une note').fill(note)
				await page.getByRole('button', { name: 'Publier la note' }).click()
				await expect(page.getByText(note)).toBeVisible()
			}

			await page.goto(`/${eventId}/admin/dashboard?take=2`)
			const loadPrevious = page.getByRole('button', { name: /entrées précédentes/ })
			// Fenêtre de deux: les deux dernières notes, et rien avant.
			await expect(page.getByText(notes[2])).toBeVisible()
			await expect(page.getByText(notes[0])).toHaveCount(0)
			await expect(loadPrevious).toBeVisible()
			// Tant qu'il reste des entrées au-dessus, on n'est pas au début du journal.
			await expect(page.getByText('Début du journal')).toHaveCount(0)

			await loadPrevious.click()

			await expect(page.getByText(notes[0])).toBeVisible()
			await expect(page.getByText('Début du journal')).toBeVisible()
			await expect(loadPrevious).toHaveCount(0)
		},
		/**
		 * La médiathèque est un tiroir unique, monté par le layout de l'évènement: chaque
		 * `InputMedia` et l'éditeur riche l'ouvrent, au lieu d'en monter chacun le sien.
		 */
		async expectMediaDrawer(page: Page) {
			const drawer = page.getByRole('dialog', { name: 'Médiathèque' })
			// `exact`: la tuile de l'image déposée plus bas s'appelle « Affiche test ».
			const poster = page.getByRole('button', { name: 'Affiche', exact: true })
			const saveBar = page.getByText('Modification en cours !')
			const openDrawer = () =>
				expect(async () => {
					await poster.click()
					await expect(drawer).toBeVisible({ timeout: 1000 })
				}).toPass()

			await page.goto(`/${eventId}/admin/settings`)
			await expect(poster).toBeVisible()
			// Fermé, le tiroir n'existe pas: c'est ce qui garde sa requête hors des chargements
			// de page, et ce qui prouve qu'il n'y en a pas un par champ.
			await expect(drawer).toHaveCount(0)

			await openDrawer()
			await expect(drawer).toHaveCount(1)
			await expect(page.getByRole('button', { name: /Déposez une image/ })).toBeVisible()

			// Le glisser-déposer accepte le lâcher partout dans le tiroir, et doit écrire le fichier
			// dans l'input du formulaire: c'est lui qui part dans le `FormData`. Le recadrage qui
			// s'ouvre prouve que le fichier est arrivé.
			const dataTransfer = await page.evaluateHandle((base64) => {
				const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
				const transfer = new DataTransfer()
				transfer.items.add(new File([bytes], 'glisse.png', { type: 'image/png' }))
				return transfer
			}, BLUE_SQUARE_PNG)
			// Le lâcher part sur l'enveloppe, et non sur la zone: c'est tout le tiroir qui l'accepte.
			await drawer.getByRole('presentation').dispatchEvent('drop', { dataTransfer })
			await expect(page.getByLabel("Description de l'image")).toBeVisible()
			// Échap ferme la modale, que le tiroir laisse passer tant qu'un `dialog[open]` existe.
			await page.keyboard.press('Escape')
			await expect(page.getByLabel("Description de l'image")).toBeHidden()

			// La médiathèque d'un évènement neuf est vide: on y dépose une image pour pouvoir la
			// choisir. Le champ de fichier est caché, `setInputFiles` n'en a pas besoin.
			await page.locator('input[type="file"][name="image"]').setInputFiles({
				name: 'affiche.png',
				mimeType: 'image/png',
				buffer: Buffer.from(BLUE_SQUARE_PNG, 'base64'),
			})
			await page.getByLabel("Description de l'image").fill('Affiche test')
			await page.getByRole('button', { name: 'Valider', exact: true }).click()

			// L'image envoyée est choisie dans la foulée. Elle atterrit dans un champ caché, écrit
			// par du code depuis un tiroir monté hors du formulaire: sans annonce de sa part, la
			// barre de sauvegarde ne verrait rien.
			await expect(saveBar).toBeVisible()
			await expect(poster.getByRole('img', { name: 'Affiche' })).toBeVisible()

			await page.getByRole('button', { name: 'Réinitialiser' }).click()
			await expect(saveBar).toBeHidden()

			await openDrawer()
			await page.keyboard.press('Escape')
			await expect(drawer).toBeHidden()

			// Le tiroir garde l'image déposée: on la choisit cette fois à la main.
			await openDrawer()
			await page.getByRole('button', { name: 'Affiche test' }).click()
			await expect(drawer).toBeHidden()
			await expect(saveBar).toBeVisible()
			await page.getByRole('button', { name: 'Réinitialiser' }).click()
			await expect(saveBar).toBeHidden()

			// Un envoi un peu lourd dure, et le tiroir peut être fermé entre-temps — Échap, clic
			// sur le voile, impatience. La réponse doit quand même remplir le champ: c'est
			// pourquoi le formulaire d'envoi vit hors du tiroir, dont la fermeture le démonterait.
			await page.route('**/uploadMedia', async (route) => {
				await new Promise((resolve) => setTimeout(resolve, 2000))
				await route.continue()
			})
			await openDrawer()
			await page.locator('input[type="file"][name="image"]').setInputFiles({
				name: 'lente.png',
				mimeType: 'image/png',
				buffer: Buffer.from(BLUE_SQUARE_PNG, 'base64'),
			})
			await page.getByLabel("Description de l'image").fill('Affiche lente')
			await page.getByRole('button', { name: 'Valider', exact: true }).click()
			// Le recadrage se ferme au clic, sans attendre la réponse: Échap va donc au tiroir.
			await expect(page.getByLabel("Description de l'image")).toBeHidden()
			await page.keyboard.press('Escape')
			await expect(drawer).toBeHidden()
			await expect(saveBar).toBeVisible()
			await page.getByRole('button', { name: 'Réinitialiser' }).click()
			await expect(saveBar).toBeHidden()
			await page.unroute('**/uploadMedia')

			// « Image de fond » est le seul des trois champs image à écrire dans l'état global
			// `theme`, que le layout reposait depuis `data.event` à chaque nouvelle donnée — donc
			// à chaque soumission distante, qui fait rejouer les `load`. L'image envoyée depuis ce
			// champ était ainsi écrasée dans la seconde qui suivait son choix.
			const background = page.getByRole('button', { name: 'Image de fond', exact: true })
			await expect(async () => {
				await background.click()
				await expect(drawer).toBeVisible({ timeout: 1000 })
			}).toPass()
			await page.locator('input[type="file"][name="image"]').setInputFiles({
				name: 'fond.png',
				mimeType: 'image/png',
				buffer: Buffer.from(BLUE_SQUARE_PNG, 'base64'),
			})
			await page.getByLabel("Description de l'image").fill('Fond test')
			await page.getByRole('button', { name: 'Valider', exact: true }).click()
			await expect(drawer).toBeHidden()
			await expect(page.locator('input[name="backgroundImageId"]')).not.toHaveValue('')
			await expect(saveBar).toBeVisible()
			await page.getByRole('button', { name: 'Réinitialiser' }).click()
			await expect(saveBar).toBeHidden()

			// L'éditeur riche ouvre le même tiroir.
			await page.goto(`/${eventId}/admin/pages`)
			await expect(page.locator('.tiptap')).toBeVisible()
			await expect(async () => {
				await page.getByRole('button', { name: 'Insérer' }).click()
				await page.getByRole('button', { name: 'Image', exact: true }).click({ timeout: 1000 })
				await expect(drawer).toBeVisible({ timeout: 1000 })
			}).toPass()
			await expect(drawer).toHaveCount(1)
		},
		/**
		 * Le tiroir de champ de profil. Le type pilote les blocs conditionnels, et les trois
		 * cases sont couplées: « modifiable » et « obligatoire » supposent « visible », et
		 * retirer la visibilité retire les deux autres. Chaque case repilotée l'est par le champ
		 * distant, pas par le DOM: seul un aller-retour complet prouve que son état part au
		 * serveur. Lier `undefined` à l'éditeur d'options levait par ailleurs dans un effet de
		 * rendu, ce qui figeait le formulaire entier — le type choisi n'ouvrait plus aucun bloc.
		 */
		async expectMemberFieldForm(page: Page) {
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

			// Le popover d'`InputSelect` ne réagit qu'une fois la page hydratée: rejouer le couple
			// clic/vérification attend l'hydratation sans avoir à la deviner.
			const selectType = async (label: string) => {
				await expect(async () => {
					if (!(await typeTrigger.textContent())?.includes(label)) {
						await typeTrigger.click()
						await page.getByRole('option', { name: label, exact: true }).click({ timeout: 1000 })
					}
					await expect(typeTrigger).toContainText(label, { timeout: 1000 })
				}).toPass()
			}

			await page.goto(`/${eventId}/admin/settings?form_field=%7B%7D`)
			await expect(drawer).toBeVisible()

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
		},
		/**
		 * Le profil d'un membre s'édite là où il s'affiche: plus de tiroir, des champs à choix
		 * rendus en listes déroulantes, et la barre de sauvegarde pour valider. La liste
		 * déroulante est le cas fragile — sa sélection vit dans le composant, que ni le
		 * `reset()` natif ni l'arrivée de nouvelles données ne restaurent: seul son remontage
		 * la ramène sur la valeur enregistrée.
		 */
		async expectMemberProfileSaveBar(page: Page) {
			const saveBar = page.getByText('Modification en cours !')
			const drawer = page.getByRole('dialog', { name: 'Nouveau champ' })
			const typeTrigger = page.getByRole('button', { name: 'Type de champ' })
			const newOption = page.getByPlaceholder('Nouvelle option')

			// Les deux formes de champ à choix, seul moyen d'éprouver les listes déroulantes du
			// mode compact. `exact`: « Liste à choix multiple » commence par les mêmes mots.
			const createField = async (type: string, name: string, options: string[]) => {
				await page.goto(`/${eventId}/admin/settings?form_field=%7B%7D`)
				await expect(drawer).toBeVisible()
				// Le popover ne réagit qu'une fois la page hydratée: rejouer le couple
				// clic/vérification attend l'hydratation sans avoir à la deviner.
				await expect(async () => {
					if ((await typeTrigger.textContent()) !== type) {
						await typeTrigger.click()
						await page.getByRole('option', { name: type, exact: true }).click({ timeout: 1000 })
					}
					await expect(typeTrigger).toContainText(type, { timeout: 1000 })
				}).toPass()
				await page.getByLabel('Nom', { exact: true }).fill(name)
				for (const option of options) {
					await newOption.fill(option)
					await newOption.press('Enter')
				}
				await page.locator('label').filter({ hasText: 'Modifiable par les membres' }).click()
				await page.getByRole('button', { name: 'Valider', exact: true }).last().click()
				await expect(drawer).toBeHidden()
			}

			await createField('Liste à choix', 'Repas', ['Omnivore', 'Végétarien'])
			await createField('Liste à choix multiple', 'Allergies', ['Gluten', 'Arachide'])

			// La table renvoie sur la fiche du membre; le tiroir de profil n'existe plus.
			await page.goto(`/${eventId}/admin/members`)
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

			await expect(async () => {
				await city.fill('Genève')
				await expect(saveBar).toBeVisible({ timeout: 1000 })
			}).toPass()
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
		},
		/**
		 * L'édition d'une page passe par la barre de sauvegarde, et non plus par un
		 * enregistrement automatique. Le contenu riche est le cas fragile: sa valeur vit dans un
		 * champ caché que le code écrit, sans le moindre évènement de formulaire — la barre ne
		 * le voit que si l'éditeur le lui signale.
		 */
		async expectPageEditorSaveBar(page: Page) {
			await page.goto(`/${eventId}/admin/pages`)

			const saveBar = page.getByText('Modification en cours !')
			const title = page.getByLabel('Titre')
			const editor = page.locator('.tiptap')

			await expect(title).toBeVisible()
			await expect(saveBar).toBeHidden()
			const originalTitle = await title.inputValue()

			// La barre ne suit rien tant que la page n'est pas hydratée: rejouer la saisie attend
			// l'hydratation sans avoir à la deviner.
			await expect(async () => {
				await title.fill('Accueil des bénévoles')
				await expect(saveBar).toBeVisible({ timeout: 1000 })
			}).toPass()

			await page.getByRole('button', { name: 'Réinitialiser' }).click()
			await expect(saveBar).toBeHidden()
			await expect(title).toHaveValue(originalTitle)

			await editor.click()
			await page.keyboard.type('Un contenu de test')
			await expect(saveBar).toBeVisible()

			await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
			await expect(page.getByText('Page enregistrée')).toBeVisible()
			await expect(saveBar).toBeHidden()

			await page.reload()
			await expect(editor).toContainText('Un contenu de test')
			await expect(title).toHaveValue(originalTitle)
			await expect(saveBar).toBeHidden()

			// Une frappe unique suffit: l'éditeur n'écrit sa valeur dans le champ caché qu'au
			// rendu suivant, et la barre doit la lire après ce rendu, pas avant.
			await editor.click()
			await page.keyboard.type('!')
			await expect(saveBar).toBeVisible()
			// Revenu à l'état d'origine, le formulaire n'a plus rien à enregistrer.
			await page.keyboard.press('Backspace')
			await expect(saveBar).toBeHidden()

			// Une page neuve: son contenu vide, que l'éditeur normalise en document ProseMirror,
			// ne doit pas passer pour une saisie.
			await page.locator('div:has(> h2:text-is("Pages du site")) form button').click()
			await expect(title).toHaveValue('Page 2')
			await expect(editor).toBeVisible()
			// L'écriture de la valeur est différée: seul un délai prouve qu'elle n'a rien signalé.
			await page.waitForTimeout(500)
			await expect(saveBar).toBeHidden()

			// Quitter une page dont le formulaire n'est pas enregistré est refusé: la navigation
			// est annulée et la barre s'alarme, sans rien perdre de la saisie.
			// Le lien de la liste latérale: `exact` écarte le lien vers la page publique, qui
			// porte le même mot dans son chemin, et `main` la marque du bandeau.
			const otherPageLink = page
				.getByRole('main')
				.getByRole('link', { name: originalTitle, exact: true })
			const editedUrl = page.url()
			await title.fill('Titre abandonné')
			await expect(saveBar).toBeVisible()
			await otherPageLink.click()
			await expect(page.locator('.save-bar-alert')).toBeVisible()
			// Un départ annulé ne laisse rien à attendre: seul un délai prouve qu'il n'a pas eu
			// lieu. Il couvre aussi le tremblement, qui rendrait les boutons instables.
			await page.waitForTimeout(500)
			await expect(page).toHaveURL(editedUrl)
			await expect(title).toHaveValue('Titre abandonné')
			await expect(saveBar).toBeVisible()

			// La barre refermée, le départ passe. Changer de page ne remonte pas le formulaire:
			// il repart de l'enregistrement chargé au lieu de rester ouvert sur les valeurs de
			// la page quittée.
			await page.getByRole('button', { name: 'Réinitialiser' }).click()
			await expect(saveBar).toBeHidden()
			await otherPageLink.click()
			await expect(title).toHaveValue(originalTitle)
			await expect(saveBar).toBeHidden()
		},
		/**
		 * La barre de sauvegarde est le seul retour sur une modification: elle doit rester
		 * invisible au chargement, apparaître à la première frappe, et disparaître aussi bien
		 * par « Réinitialiser » que par un enregistrement. Rien d'autre ne couvre ce contrat.
		 */
		async expectSettingsSaveBar(page: Page) {
			const saveBar = page.getByText('Modification en cours !')
			// `exact`: le sélecteur de média de la section Apparence porte un « Description
			// de l'image » qui rendrait le libellé ambigu.
			const description = page.getByLabel('Description', { exact: true })

			// Le thème n'a pas de `defaultValue`: un `reset` mal ordonné y écrirait du vide, que
			// l'enregistrement suivant graverait en base (`#000000`). On le surveille de bout en bout.
			const backgroundColor = page.locator('input[name="backgroundColor"]')

			await page.goto(`/${eventId}/admin/settings`)
			await expect(description).toBeVisible()
			await expect(saveBar).toBeHidden()
			await expect(backgroundColor).toHaveValue('#ffffff')
			// Les champs de profil forment leur propre section, titrée par la page et non
			// plus par `MemberFields`.
			await expect(page.getByRole('heading', { name: 'Champs du profil' })).toBeVisible()
			// La zone de danger vit hors du grand `<form>`: sa confirmation porte le sien.
			await expect(page.getByRole('heading', { name: 'Zone de danger' })).toBeVisible()
			await expect(page.getByRole('button', { name: "Supprimer l'évènement" })).toBeVisible()
			// L'ancre de section est portée par le sommaire de la page, une seule fois.
			// `:visible`: il est masqué sous `lg`, la fenêtre par défaut est plus large.
			await expect(page.locator('a[href="#fields"]:visible')).toHaveCount(1)

			// La barre ne suit rien tant que la page n'est pas hydratée: rejouer la saisie attend
			// l'hydratation sans avoir à la deviner.
			await expect(async () => {
				await description.fill('Un centre de recherche appliquée.')
				await expect(saveBar).toBeVisible({ timeout: 1000 })
			}).toPass()

			await page.getByRole('button', { name: 'Réinitialiser' }).click()
			await expect(saveBar).toBeHidden()
			await expect(description).toHaveValue('')
			await expect(backgroundColor).toHaveValue('#ffffff')

			await description.fill('Un centre de recherche appliquée.')
			await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
			await expect(page.getByText('Modifications enregistrées')).toBeVisible()
			await expect(saveBar).toBeHidden()

			// Rechargement: la description est enregistrée, la couleur intacte, la barre muette.
			await page.reload()
			await expect(description).toHaveValue('Un centre de recherche appliquée.')
			await expect(backgroundColor).toHaveValue('#ffffff')
			await expect(saveBar).toBeHidden()
		},
		/**
		 * Un thème pose son image et ses réglages par du code: ni `fields.set()` ni une écriture
		 * dans l'aperçu n'émettent d'évènement DOM, et la barre de sauvegarde ne surveille que
		 * ceux-là. Sans l'annonce que le champ caché se fait à lui-même, le choix est bien peint
		 * à l'écran mais n'atteint jamais le serveur — c'est ce silence que le test ferme.
		 */
		async expectThemePresets(page: Page) {
			const saveBar = page.getByText('Modification en cours !')
			const preset = page.locator('input[name="backgroundPreset"]')
			const background = page.locator('.event-background')
			const noTheme = page.getByRole('radio', { name: 'Personalisé' })
			const papier = page.getByRole('radio', { name: 'Papier' })

			await page.goto(`/${eventId}/admin/settings`)
			await expect(noTheme).toHaveAttribute('aria-checked', 'true')
			await expect(preset).toHaveValue('')

			await expect(async () => {
				await papier.click()
				await expect(saveBar).toBeVisible({ timeout: 1000 })
			}).toPass()
			await expect(preset).toHaveValue('papier')
			await expect(papier).toHaveAttribute('aria-checked', 'true')
			// L'aperçu suit dans la foulée: le fond du site porte l'image du thème.
			await expect(background).toHaveAttribute('style', /\/themes\/papier\.svg/)

			await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
			await expect(page.getByText('Modifications enregistrées')).toBeVisible()
			await page.reload()
			await expect(preset).toHaveValue('papier')
			await expect(background).toHaveAttribute('style', /\/themes\/papier\.svg/)

			// Et le retrait repasse par la même annonce, sinon la barre resterait muette.
			await expect(async () => {
				await noTheme.click()
				await expect(saveBar).toBeVisible({ timeout: 1000 })
			}).toPass()
			await expect(preset).toHaveValue('')
			await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
			await expect(page.getByText('Modifications enregistrées')).toBeVisible()
			await expect(saveBar).toBeHidden()
		},
		/**
		 * L'état d'un `form()` distant vit dans son module et survit au démontage du formulaire:
		 * sans une instance par secteur, ce qui a été saisi sur l'un se retrouve sur le suivant,
		 * par-dessus ses vraies valeurs. Voir AGENTS.md, « L'état d'un formulaire vit dans son
		 * module ». La barre de sauvegarde ferme la première porte — quitter un secteur modifié
		 * est refusé — et l'instance par secteur la seconde, une fois la saisie abandonnée.
		 */
		async expectTeamFormStateIsPerTeam(page: Page) {
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
				// Saisi avant l'hydratation, le nom serait écrasé par le rendu client, qui repose
				// la valeur initiale du champ.
				await expect(async () => {
					await newName.fill(teamName)
					await expect(newName).toHaveValue(teamName, { timeout: 1000 })
				}).toPass()
				await newDrawer.getByRole('button', { name: 'Valider', exact: true }).click()
				// La création referme le tiroir et ouvre le secteur: sans hydratation la soumission
				// native re-rendrait la page avec son paramètre. La suite observe donc bien
				// l'application hydratée.
				await expect(newDrawer).toBeHidden()
				await expect(name).toHaveValue(teamName)
			}

			await page.goto(`/${eventId}/admin/teams`)

			// Le filtre du volet gauche est purement client: le voir répondre attend l'hydratation
			// sans avoir à la deviner. Sans elle, le nom saisi dans le tiroir serait écrasé par le
			// premier rendu client, qui repose la valeur initiale du champ.
			const searchTeams = page.getByLabel('Rechercher un secteur')
			await expect(async () => {
				await searchTeams.fill('zzz')
				await expect(page.getByText('Aucun secteur trouvé')).toBeVisible({ timeout: 1000 })
			}).toPass()
			await searchTeams.fill('')

			await createTeam('Alpha')
			await createTeam('Bravo')

			// Alpha: on touche aux deux champs, et on tente de le quitter sans valider.
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
		},
	}
}
