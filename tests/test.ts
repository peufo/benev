import { expect, test } from '@playwright/test'
import { useUser } from './user'
import { useEvent } from './event'
import { gotoHydrated } from './hydrated'
import { mockPhoton, testPlace } from './photon'
import { sharedPage } from './sharedPage'

test('Page vitrine', async ({ page }) => {
	await gotoHydrated(page, '/')
	await expect(page).toHaveTitle(/benevio/i)
	await expect(page.getByRole('heading', { name: /Laisse tes bénévoles faire/i })).toBeVisible()
})

// serial + page partagée: la session doit survivre d'une étape à l'autre
test.describe.serial("Parcours d'un organisateur", () => {
	const bob = useUser('Bob')
	const event = useEvent('Aperture')
	const page = sharedPage()

	test("Création d'un compte", async () => {
		await bob.register(page)
		await bob.expectConnected(page)
	})

	// contexte neuf: connecté, /auth redirige et le formulaire n'existe plus
	test('Reconnexion depuis une session vierge', async ({ page: freshPage }) => {
		await bob.login(freshPage)
		await bob.expectConnected(freshPage)
	})

	/**
	 * Une soumission refusée ne doit rien effacer. Le `<select>` est le cas fragile: sa valeur
	 * ne vit que dans la liaison de `InputSelectNative`, que le re-rendu du champ, déclenché par
	 * l'arrivée des erreurs, n'a aucune raison de rejouer.
	 */
	test('Une soumission refusée ne vide aucun champ', async () => {
		await gotoHydrated(page, '/me/events/create')
		const name = page.getByLabel("Nom de l'évènement")
		const url = page.getByLabel("URL de l'évènement")
		const timezone = page.getByLabel('Fuseau horaire')

		// Deux caractères: sous le minimum de trois du modèle, donc refusé par le serveur.
		await name.fill('ab')
		await expect(url).toHaveValue('ab')
		const zone = await timezone.inputValue()
		expect(zone).not.toBe('')

		await page.getByRole('button', { name: 'Créer mon évènement' }).click()
		await expect(page.getByText('Formulaire incorrect')).toBeVisible()
		await expect(name).toHaveValue('ab')
		await expect(url).toHaveValue('ab')
		await expect(timezone).toHaveValue(zone)
	})

	test("Création d'un évènement avec un lieu", async () => {
		await event.create(page)
	})

	test("Navigation sur l'évènement", async () => {
		// La création ne demande pas le lieu: il se pose depuis les réglages.
		await mockPhoton(page)
		await gotoHydrated(page, `/${event.eventId}/admin/settings`)
		// Le champ de recherche vit dans le popover d'`InputSelect`: il faut l'ouvrir d'abord.
		await page.getByLabel('Lieu', { exact: true }).click()
		await page.locator('input[placeholder="Recherche"]:visible').fill('salle des fetes')
		await page.locator('li, [role="option"]').filter({ hasText: 'Salle des fêtes' }).first().click()

		await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
		await expect(page.getByText('Modifications enregistrées')).toBeVisible()
		await gotoHydrated(page, `/${event.eventId}`)
		await expect(page).toHaveTitle(new RegExp(event.eventName))

		// Le lieu est stocké en Json (`Event.location`), que rien ne type à l'écriture: seul son
		// rendu en pied de page prouve que la colonne reçoit bien un lieu.
		const link = page.getByRole('link', { name: new RegExp(testPlace.label, 'i') })
		await expect(link).toBeVisible()
		await expect(link).toHaveAttribute(
			'href',
			`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
				`${testPlace.lat},${testPlace.lon}`
			)}`
		)
	})

	/**
	 * L'encodage des filtres de colonne est un contrat entre les `TableHead*` de fuma, qui
	 * l'écrivent dans l'URL, et les schémas de `#lib/models/filter.js`, qui le relisent. Rien
	 * ne relie les deux bouts: on constate ici qu'une URL filtrée passe bout en bout, là où
	 * `src/tests/filter.test.ts` ne vérifie que le schéma.
	 */
	test('Filtres des tables admin', async () => {
		// Une forme d'encodage par cas, et non une par colonne: c'est le format que les deux
		// bouts doivent s'accorder, et `src/tests/filter.test.ts` en tient déjà le schéma.
		const cases: [string, string][] = [
			['members', 'subscribes_hours={"min":2,"max":8,"order":"asc"}'],
			['members', 'createdAt={"start":"2024-01-01T00:00:00.000Z","order":"desc"}'],
			['members', 'subscribes_teams=["a","b"]'],
			['subscribes', 'isAbsent=false'],
		]

		for (const [route, query] of cases) {
			const response = await gotoHydrated(page, `/${event.eventId}/admin/${route}?${query}`)
			expect(response?.status(), `${route}?${query}`).toBeLessThan(400)
			// `ensureFieldsWithFilterAreVisibles` peut rediriger pour rendre la colonne
			// visible, mais le filtre lui-même doit survivre au passage.
			const key = query.split('=')[0]
			expect(new URL(page.url()).searchParams.has(key), `${route} garde ${key}`).toBe(true)
		}
	})

	/**
	 * Le journal se lit, se filtre, et accepte une note. Les lignes attendues ont été écrites
	 * par les étapes précédentes du parcours: c'est le tour complet écriture -> rendu, seul à
	 * pouvoir attraper une charge utile qui ne correspondrait plus à son composant.
	 *
	 * Après le lieu: le journal le rend parmi les réglages modifiés.
	 */
	test('Le journal rend ce que le parcours a écrit, et accepte une note', async () => {
		await gotoHydrated(page, `/${event.eventId}/admin/dashboard`)

		// Le fil tient dans une fenêtre: rien à charger avant, donc l'accueil et non le bouton.
		await expect(page.getByText('Début du journal')).toBeVisible()
		await expect(page.getByRole('button', { name: /entrées précédentes/ })).toHaveCount(0)

		// Les réglages modifiés plus haut, rendus par leur diff.
		await expect(page.getByText("a modifié les réglages de l'évènement").first()).toBeVisible()
		await expect(page.getByText('Lieu').first()).toBeVisible()

		// La note est la dernière chose arrivée: elle se pose en bas du fil.
		const note = `Rappeler le comité ${event.eventId}`
		await page.getByPlaceholder('Ajouter une note').fill(note)
		await page.getByRole('button', { name: 'Publier la note' }).click()
		const entries = page.getByRole('listitem')
		await expect(entries.last()).toContainText(note)

		// Le filtre par famille ne laisse que la note.
		await page.getByRole('button', { name: 'Tout le journal' }).click()
		await page.getByRole('option', { name: 'Notes' }).click()
		await expect(page.getByText(note)).toBeVisible()
		await expect(page.getByText("a modifié les réglages de l'évènement")).toHaveCount(0)

		await page.getByRole('button', { name: 'Supprimer la note' }).click()
		await expect(page.getByText(note)).toHaveCount(0)
	})

	/**
	 * Le fil se charge vers le passé. `take` est piloté par l'URL, ce qui permet de réduire la
	 * fenêtre à deux entrées au lieu d'en écrire trente pour atteindre le bouton.
	 */
	test('Le journal charge les entrées précédentes vers le haut', async () => {
		await gotoHydrated(page, `/${event.eventId}/admin/dashboard`)
		const notes = ['Alpha', 'Bravo', 'Charlie'].map((n) => `${n} ${event.eventId}`)
		for (const note of notes) {
			await page.getByPlaceholder('Ajouter une note').fill(note)
			await page.getByRole('button', { name: 'Publier la note' }).click()
			await expect(page.getByText(note)).toBeVisible()
		}

		await gotoHydrated(page, `/${event.eventId}/admin/dashboard?take=2`)
		const loadPrevious = page.getByRole('button', { name: /entrées précédentes/ })
		await expect(page.getByText(notes[2])).toBeVisible()
		await expect(page.getByText(notes[0])).toHaveCount(0)
		await expect(loadPrevious).toBeVisible()
		await expect(page.getByText('Début du journal')).toHaveCount(0)

		await loadPrevious.click()

		await expect(page.getByText(notes[0])).toBeVisible()
		await expect(page.getByText('Début du journal')).toBeVisible()
		await expect(loadPrevious).toHaveCount(0)
	})
})
