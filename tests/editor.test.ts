import { expect, test } from '@playwright/test'
import { useEvent } from './event'
import { seedUser, signIn } from './seed'
import { awaitHydrated, gotoHydrated } from './hydrated'
import { sharedPage } from './sharedPage'

/** Un aplat bleu de 64×64, de quoi nourrir la médiathèque sans fichier à versionner. */
const BLUE_SQUARE_PNG =
	'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAUElEQVR42u3PQQkAAAgEsEtjMeNbwgi+hcEKLNXzWgQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQErsACvwRBWjdZC+AAAAAASUVORK5CYII='

test.describe.serial('Publications et médiathèque', () => {
	const event = useEvent('Editeur')
	const page = sharedPage()

	test('Préparation: un évènement', async () => {
		await signIn(page, await seedUser('Eli'))
		await event.create(page)
	})

	/**
	 * Le contenu riche est le cas fragile: sa valeur vit dans un champ caché que le code écrit,
	 * sans le moindre évènement de formulaire. La barre ne le voit que si l'éditeur le lui
	 * signale.
	 */
	test("L'édition d'une page s'enregistre par la barre de sauvegarde", async () => {
		await gotoHydrated(page, `/${event.eventId}/admin/pages`)
		// La liste occupe seule la colonne de gauche: aucune publication n'est ouverte tant
		// qu'on n'en a pas choisi une.
		await page.locator('aside').getByRole('link', { name: 'Bienvenue' }).click()

		const saveBar = page.getByText('Modification en cours !')
		const title = page.getByLabel('Titre')
		const editor = page.locator('.tiptap')

		await expect(title).toBeVisible()
		await expect(saveBar).toBeHidden()
		const originalTitle = await title.inputValue()

		await editor.click()
		await page.keyboard.type('Un contenu de test')
		await expect(saveBar).toBeVisible()

		await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
		await expect(page.getByText('Page enregistrée')).toBeVisible()
		await expect(saveBar).toBeHidden()

		await page.reload()
		await awaitHydrated(page)
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
		await page.locator('div:has(> h2:text-is("Navigation")) form button').click()
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
		// lieu.
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
	})

	/**
	 * La médiathèque est un tiroir unique, monté par le layout de l'évènement: chaque
	 * `InputMedia` et l'éditeur riche l'ouvrent, au lieu d'en monter chacun le sien.
	 */
	test('La médiathèque est un tiroir unique', async () => {
		const drawer = page.getByRole('dialog', { name: 'Médiathèque' })
		// `exact`: la tuile de l'image déposée plus bas s'appelle « Affiche test ».
		const poster = page.getByRole('button', { name: 'Affiche', exact: true })
		const saveBar = page.getByText('Modification en cours !')
		const openDrawer = async () => {
			await poster.click()
			await expect(drawer).toBeVisible()
		}

		await gotoHydrated(page, `/${event.eventId}/admin/settings`)
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
		await page.locator('input[type="file"][name^="image/"]').setInputFiles({
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

		// Un envoi un peu lourd dure, et le tiroir peut être fermé entre-temps (Échap, clic
		// sur le voile, impatience). La réponse doit quand même remplir le champ: c'est
		// pourquoi le formulaire d'envoi vit hors du tiroir, dont la fermeture le démonterait.
		// L'envoi est retenu jusqu'à ce que le tiroir soit fermé, quelle que soit la machine.
		let releaseUpload = () => {}
		const uploadHeld = new Promise<void>((resolve) => (releaseUpload = resolve))
		await page.route('**/uploadMedia', async (route) => {
			await uploadHeld
			await route.continue()
		})
		await openDrawer()
		await page.locator('input[type="file"][name^="image/"]').setInputFiles({
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
		releaseUpload()
		await expect(saveBar).toBeVisible()
		await page.getByRole('button', { name: 'Réinitialiser' }).click()
		await expect(saveBar).toBeHidden()
		await page.unroute('**/uploadMedia')

		// « Image de fond » est le seul des trois champs image à vivre dans l'état global
		// `theme`, que chaque soumission distante, en rejouant les `load`, risque de reposer
		// depuis `data.event` (voir `EventTheme.svelte`).
		const background = page.getByRole('button', { name: 'Image de fond', exact: true })
		await background.click()
		await expect(drawer).toBeVisible()
		await page.locator('input[type="file"][name^="image/"]').setInputFiles({
			name: 'fond.png',
			mimeType: 'image/png',
			buffer: Buffer.from(BLUE_SQUARE_PNG, 'base64'),
		})
		await page.getByLabel("Description de l'image").fill('Fond test')
		await page.getByRole('button', { name: 'Valider', exact: true }).click()
		await expect(drawer).toBeHidden()
		await expect(page.locator('input[name^="backgroundImageId/"]')).not.toHaveValue('')
		await expect(saveBar).toBeVisible()
		await page.getByRole('button', { name: 'Réinitialiser' }).click()
		await expect(saveBar).toBeHidden()

		// L'éditeur riche ouvre le même tiroir.
		await gotoHydrated(page, `/${event.eventId}/admin/pages`)
		await page.locator('aside').getByRole('link', { name: 'Bienvenue' }).click()
		await expect(page.locator('.tiptap')).toBeVisible()
		await page.getByRole('button', { name: 'Insérer' }).click()
		await page.getByRole('button', { name: 'Image', exact: true }).click()
		await expect(drawer).toBeVisible()
		await expect(drawer).toHaveCount(1)
	})
})
