import { expect, test } from '@playwright/test'
import { useEvent } from './event'
import { seedTeam, seedUser, signIn } from './seed'
import { awaitHydrated, gotoHydrated } from './hydrated'
import { sharedPage } from './sharedPage'

test.describe.serial("Réglages de l'évènement", () => {
	const event = useEvent('Reglages')
	const page = sharedPage()

	test('Préparation: un évènement, un secteur en brouillon', async () => {
		await signIn(page, await seedUser('Cave'))
		await event.create(page)
		await seedTeam(event.eventId, 'Alpha')
	})

	/**
	 * La barre de sauvegarde est le seul retour sur une modification: elle doit rester
	 * invisible au chargement, apparaître à la première frappe, et disparaître aussi bien
	 * par « Réinitialiser » que par un enregistrement. Rien d'autre ne couvre ce contrat.
	 */
	test('La barre de sauvegarde des réglages suit les modifications', async () => {
		const saveBar = page.getByText('Modification en cours !')
		// `exact`: le sélecteur de média de la section Apparence porte un « Description
		// de l'image » qui rendrait le libellé ambigu.
		const description = page.getByLabel('Description', { exact: true })

		// Le thème n'a pas de `defaultValue`: un `reset` mal ordonné y écrirait du vide, que
		// l'enregistrement suivant graverait en base (`#000000`). On le surveille de bout en bout.
		const backgroundColor = page.locator('input[name^="backgroundColor/"]')

		await gotoHydrated(page, `/${event.eventId}/admin/settings`)
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

		await description.fill('Un centre de recherche appliquée.')
		await expect(saveBar).toBeVisible()

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
		await awaitHydrated(page)
		await expect(description).toHaveValue('Un centre de recherche appliquée.')
		await expect(backgroundColor).toHaveValue('#ffffff')
		await expect(saveBar).toBeHidden()

		// Le formulaire tient son instance de l'évènement édité: les refus du serveur
		// doivent atteindre le champ de *cette* instance, sans quoi rien ne s'affiche.
		const eventUrl = page.getByLabel("URL de l'évènement")
		await eventUrl.fill('admin')
		await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
		await expect(page.getByText(/Ce nom n'est pas disponible/)).toBeVisible()
		await expect(eventUrl).toHaveAttribute('aria-invalid', 'true')
		await expect(saveBar).toBeVisible()

		await page.getByRole('button', { name: 'Réinitialiser' }).click()
		await expect(saveBar).toBeHidden()
		await expect(eventUrl).toHaveValue(event.eventId)
	})

	/**
	 * Un thème pose son image et ses réglages par du code: ni `fields.set()` ni une écriture
	 * dans l'aperçu n'émettent d'évènement DOM, et la barre de sauvegarde ne surveille que
	 * ceux-là. Sans l'annonce que le champ caché se fait à lui-même, le choix est bien peint
	 * à l'écran mais n'atteint jamais le serveur — c'est ce silence que le test ferme.
	 */
	test("Le thème posé à la création se change, s'enregistre et se retire", async () => {
		const saveBar = page.getByText('Modification en cours !')
		const preset = page.locator('input[name^="backgroundPreset/"]')
		const background = page.locator('.event-background')
		const noTheme = page.getByRole('radio', { name: 'Personnalisé' })
		const benevio = page.getByRole('radio', { name: 'benevio' })
		const papier = page.getByRole('radio', { name: 'Papier' })

		await gotoHydrated(page, `/${event.eventId}/admin/settings`)
		// Un évènement naît habillé: la création lui pose le thème benevio et ses réglages.
		await expect(benevio).toHaveAttribute('aria-checked', 'true')
		await expect(preset).toHaveValue('benevio')
		await expect(background).toHaveAttribute('style', /\/themes\/benevio\.svg/)

		await papier.click()
		await expect(saveBar).toBeVisible()
		await expect(preset).toHaveValue('papier')
		await expect(papier).toHaveAttribute('aria-checked', 'true')
		// L'aperçu suit dans la foulée: le fond du site porte l'image du thème.
		await expect(background).toHaveAttribute('style', /\/themes\/papier\.svg/)

		await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
		await expect(page.getByText('Modifications enregistrées')).toBeVisible()
		await page.reload()
		await awaitHydrated(page)
		await expect(preset).toHaveValue('papier')
		await expect(background).toHaveAttribute('style', /\/themes\/papier\.svg/)

		// Et le retrait repasse par la même annonce, sinon la barre resterait muette.
		await noTheme.click()
		await expect(saveBar).toBeVisible()
		await expect(preset).toHaveValue('')
		await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
		await expect(page.getByText('Modifications enregistrées')).toBeVisible()
		await expect(saveBar).toBeHidden()
	})

	/**
	 * La fermeture des inscriptions par défaut vit sur l'évènement. Le formulaire de secteur la
	 * dit à côté du libellé, un champ de date n'affichant jamais son `placeholder`, et la carte
	 * publique l'annonce aux secteurs publiés qui n'en portent pas une à eux.
	 */
	test('La fin des inscriptions par défaut se lit sur le secteur et sa carte', async () => {
		await gotoHydrated(page, `/${event.eventId}/admin/settings`)
		const closeSubscribing = page.getByLabel('Fermeture des inscriptions par défaut')
		const saveBar = page.getByText('Modification en cours !')
		await closeSubscribing.fill('2099-09-12T18:00')
		await expect(saveBar).toBeVisible()
		await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
		await expect(page.getByText('Modifications enregistrées')).toBeVisible()

		// `\s`: le libellé porte une espace insécable, que la normalisation ne réduit pas.
		await gotoHydrated(page, `/${event.eventId}/admin/teams`)
		await page.locator('aside').getByRole('link', { name: 'Alpha' }).click()
		await expect(
			page.locator('#team').getByText(/Par défaut\s*:\s*12 septembre 2099 à 18:00/)
		).toBeVisible()

		// La liste des bénévoles ne porte que les secteurs publiés: Alpha, né en brouillon,
		// n'y a pas encore de carte. Le libellé de la transition suppose l'inscription libre,
		// la même condition qui fait afficher l'échéance sur la carte.
		await page.getByRole('button', { name: 'Brouillon', exact: true }).click()
		await page.getByRole('button', { name: 'Valider et ouvrir les inscriptions' }).click()
		await page.getByRole('dialog').getByRole('button', { name: 'Confirmer' }).click()
		await expect(page.getByText('Publié', { exact: true }).first()).toBeVisible()

		await gotoHydrated(page, `/${event.eventId}/teams`)
		await expect(
			page.getByText('Fin des inscriptions le 12 septembre 2099 à 18:00').first()
		).toBeVisible()

		// Le secteur peut porter la sienne, et la reprendre: un champ de date vidé doit partir
		// à blanc, sans quoi la valeur enregistrée resterait intacte.
		await gotoHydrated(page, `/${event.eventId}/admin/teams`)
		await page.locator('aside').getByRole('link', { name: 'Alpha' }).click()
		const teamClose = page.locator('#team').getByLabel('Fermeture des inscriptions')
		const saveTeam = async () => {
			await expect(saveBar).toBeVisible()
			await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
			await expect(saveBar).toBeHidden()
		}
		// La date posée se lit dans le libellé, rendu depuis la donnée relue après l'envoi.
		await teamClose.fill('2099-01-01T12:00')
		await saveTeam()
		await expect(page.getByText('Fin des inscriptions le 01 janvier 2099 à 12:00')).toBeVisible()

		// Le champ vidé, lui, ne se prouve qu'au rechargement.
		await teamClose.fill('')
		await saveTeam()
		await page.reload()
		await awaitHydrated(page)
		await expect(page.getByText('Fin des inscriptions le 01 janvier 2099 à 12:00')).toHaveCount(0)
	})
})
