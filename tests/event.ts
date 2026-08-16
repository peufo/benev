import { expect, type Page } from '@playwright/test'
import cuid from '@paralleldrive/cuid2'
import type { User } from './user'
import { mockPhoton, testPlace } from './photon'

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
			const emailInput = page.getByRole('dialog').getByLabel('Email')

			await expect(async () => {
				await emailInput.fill(email)
				await expect(page.getByText('Utilisateur trouvé !')).toBeVisible({ timeout: 2000 })
			}).toPass()
		},
		/**
		 * La médiathèque est un tiroir unique, monté par le layout de l'évènement: chaque
		 * `InputMedia` et l'éditeur riche l'ouvrent, au lieu d'en monter chacun le sien.
		 */
		async expectMediaDrawer(page: Page) {
			const drawer = page.getByRole('dialog', { name: 'Médiathèque' })
			const poster = page.getByRole('button', { name: 'Affiche' })

			await page.goto(`/${eventId}/admin/settings`)
			await expect(poster).toBeVisible()
			// Fermé, le tiroir n'existe pas: c'est ce qui garde sa requête hors des chargements
			// de page, et ce qui prouve qu'il n'y en a pas un par champ.
			await expect(drawer).toHaveCount(0)

			await expect(async () => {
				await poster.click()
				await expect(drawer).toBeVisible({ timeout: 1000 })
			}).toPass()
			await expect(drawer).toHaveCount(1)
			await expect(page.getByRole('button', { name: 'Ajouter une nouvelle image' })).toBeVisible()

			await page.keyboard.press('Escape')
			await expect(drawer).toBeHidden()

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
		 * Le tiroir de champ de profil. Le type pilote deux blocs conditionnels, et les deux
		 * droits sont couplés — « modifier » suppose « lire ». Rien de tout cela n'atteignait le
		 * serveur, et lier `undefined` à l'éditeur d'options levait dans un effet de rendu, ce
		 * qui figeait le formulaire entier: le type choisi n'ouvrait plus aucun bloc.
		 */
		async expectMemberFieldForm(page: Page) {
			const drawer = page.getByRole('dialog', { name: 'Nouveau champ' })
			const typeTrigger = page.getByRole('button', { name: 'Type de champ' })
			const canRead = page.locator('label').filter({ hasText: 'Lire la valeur' }).locator('input')
			const canWrite = page
				.locator('label')
				.filter({ hasText: 'Modifier la valeur' })
				.locator('input')
			const required = page.locator('label').filter({ hasText: 'Les membres doivent renseigner' })
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

			await selectType('Liste à choix multiple')
			await expect(newOption).toBeVisible()
			await selectType('Text')
			await expect(newOption).toBeHidden()

			await page.getByLabel('Nom', { exact: true }).fill('Ville')
			await expect(canRead).not.toBeChecked()
			await page.locator('label').filter({ hasText: 'Modifier la valeur' }).click()
			await expect(canRead).toBeChecked()
			await expect(canWrite).toBeChecked()

			await expect(required).toBeVisible()
			await required.click()

			await page.getByRole('button', { name: 'Valider', exact: true }).last().click()
			await expect(drawer).toBeHidden()

			// Réouverture: les trois cases sont restituées. C'est ce qui ne partait pas au serveur.
			await page.getByRole('button', { name: /Ville/ }).click()
			await expect(page.getByRole('dialog', { name: 'Modifier le champ' })).toBeVisible()
			await expect(canRead).toBeChecked()
			await expect(canWrite).toBeChecked()
			await expect(required.locator('input')).toBeChecked()
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
			// « Réinitialiser » remonte la section: le curseur d'opacité est alors récrit, et une
			// valeur posée avant ses bornes se fait arrondir sur la grille par défaut (0–100, pas
			// de 1). Il retombait ainsi sur son minimum pendant que le nombre affiché, lui, restait
			// juste.
			const cardOpacity = page.locator('input[name="n:cardOpacity"]')

			await page.goto(`/${eventId}/admin/settings`)
			await expect(description).toBeVisible()
			await expect(saveBar).toBeHidden()
			await expect(backgroundColor).toHaveValue('#ffffff')
			await expect(cardOpacity).toHaveValue('1')
			// Les champs de profil forment leur propre section, titrée par la page et non
			// plus par `MemberFields`.
			await expect(page.getByRole('heading', { name: 'Champs du profil' })).toBeVisible()
			// La zone de danger vit hors du grand `<form>`: sa confirmation porte le sien.
			await expect(page.getByRole('heading', { name: 'Zone de danger' })).toBeVisible()
			await expect(page.getByRole('button', { name: "Supprimer l'évènement" })).toBeVisible()
			// La navigation de second niveau est rendue par le rail admin, pas par la page.
			// `:visible` écarte la copie du menu mobile, présente dans le DOM mais repliée.
			await expect(page.locator('a[href="#fields"]:visible')).toHaveCount(1)

			await description.fill('Un centre de recherche appliquée.')
			await cardOpacity.fill('0.75')
			await expect(saveBar).toBeVisible()

			await page.getByRole('button', { name: 'Réinitialiser' }).click()
			await expect(saveBar).toBeHidden()
			await expect(description).toHaveValue('')
			await expect(backgroundColor).toHaveValue('#ffffff')
			await expect(cardOpacity).toHaveValue('1')

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
	}
}
