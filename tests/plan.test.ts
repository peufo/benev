import { expect, test, type Page } from '@playwright/test'
import { useEvent } from './event'
import { seedPeriod, seedTeam, seedUser, signIn } from './seed'
import { gotoHydrated } from './hydrated'

test.describe.serial('Plan', () => {
	const event = useEvent('Zoom')
	let page: Page

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
		await signIn(page, await seedUser('Zoe'))
		await event.create(page)
	})
	test.afterAll(async () => {
		await page.close()
	})

	/**
	 * Rend la grille, qui porte le défilement et dont la largeur suit l'échelle. Le plan se
	 * recentre sur son curseur au montage: un défilement non nul est le contrat, et ce qui dit
	 * que ses écouteurs sont posés.
	 */
	async function gotoPlan(query = '') {
		await gotoHydrated(page, `/${event.eventId}/admin/plan${query}`)
		const grid = page.locator('div.overflow-scroll.grow').first()
		await expect.poll(() => grid.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
		return grid
	}

	/**
	 * Deux contrats tiennent la fluidité du zoom, et rien dans le code ne les relie:
	 *
	 * - `plan` est un dérivé assignable, pas un état profond: seule sa réassignation redessine.
	 *   Muter `plan.hourSize` ne notifie rien, et la grille ne bougerait qu'au rechargement.
	 * - `hourSize` n'est qu'une échelle d'affichage. Le plan est la page la plus lourde de
	 *   l'application; si un `load` s'abonnait à ce paramètre, chaque cran rejouerait ses requêtes.
	 */
	test('La molette zoome à chaque cran, sans recharger les données', async () => {
		const grid = await gotoPlan()

		const dataRequests: string[] = []
		page.on('request', (request) => {
			if (request.url().includes('__data.json')) dataRequests.push(request.url())
		})

		const widthBefore = await grid.evaluate((el) => el.scrollWidth)
		const scrollBefore = await grid.evaluate((el) => el.scrollLeft)

		// Le zoom demande Ctrl: sans lui la molette défile.
		const box = (await grid.boundingBox())!
		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
		await page.keyboard.down('Control')
		await page.mouse.wheel(0, -120)
		await page.waitForTimeout(200)
		const widthOneNotch = await grid.evaluate((el) => el.scrollWidth)
		await page.mouse.wheel(0, -120)
		await page.mouse.wheel(0, -120)
		await page.keyboard.up('Control')

		// La grille suit le geste, cran par cran, sans attendre l'écriture de l'URL.
		expect(widthOneNotch).toBeGreaterThan(widthBefore)
		await expect.poll(() => grid.evaluate((el) => el.scrollWidth)).toBeGreaterThan(widthOneNotch)
		// Le point sous le curseur reste en place: la vue suit l'échelle.
		expect(await grid.evaluate((el) => el.scrollLeft)).toBeGreaterThan(scrollBefore)

		// L'échelle finit dans l'URL — mais sans que les données ne repartent.
		await expect.poll(() => page.url()).toMatch(/hourSize=/)
		expect(dataRequests).toEqual([])
	})

	/**
	 * Le modificateur se lit sur l'évènement molette, pas sur un store clavier: une touche déjà
	 * enfoncée à l'arrivée sur la page n'a produit aucun `keydown` à observer.
	 */
	test("Ctrl déjà enfoncé à l'arrivée sur le plan zoome quand même", async () => {
		await page.keyboard.down('Control')
		try {
			const grid = await gotoPlan()
			const widthBefore = await grid.evaluate((el) => el.scrollWidth)

			const box = (await grid.boundingBox())!
			await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
			await page.mouse.wheel(0, -120)

			await expect.poll(() => grid.evaluate((el) => el.scrollWidth)).toBeGreaterThan(widthBefore)
		} finally {
			await page.keyboard.up('Control')
		}
	})

	/**
	 * Les boutons +/- règlent la même échelle que la molette, par le même chemin client. En lien
	 * `href`, ils dépendaient du rechargement provoqué par l'URL, qui n'a plus lieu.
	 */
	test("Les boutons d'échelle du bandeau zooment aussi", async () => {
		const grid = await gotoPlan()

		const widthBefore = await grid.evaluate((el) => el.scrollWidth)
		// `exact`: « Zoomer » est contenu dans « Dézoomer ».
		await page.getByRole('button', { name: 'Zoomer', exact: true }).click()
		await expect.poll(() => grid.evaluate((el) => el.scrollWidth)).toBeGreaterThan(widthBefore)

		const widthZoomed = await grid.evaluate((el) => el.scrollWidth)
		await page.getByRole('button', { name: 'Dézoomer' }).click()
		await expect.poll(() => grid.evaluate((el) => el.scrollWidth)).toBeLessThan(widthZoomed)
	})

	/**
	 * L'étiquette créée depuis le formulaire de période doit s'y retrouver sélectionnée. Le
	 * formulaire ne se recharge pas entre les deux: seul le rappel `oncreated` porte la nouvelle
	 * étiquette jusqu'à l'`InputMultiSelect`.
	 */
	test('Une étiquette créée depuis un créneau y est sélectionnée', async () => {
		await gotoPlan('?form_period={}')
		// `InputMultiSelect` déclare son libellé à côté du combobox, pas dessus: `getByLabel`
		// ne le voit donc pas.
		const tags = page.getByRole('group').filter({ hasText: 'Étiquettes' }).getByRole('combobox')
		await expect(tags).toBeVisible()

		await tags.click()
		const addTag = page.locator('a[href*="form_tag"]')
		await expect(addTag).toBeVisible()
		await addTag.click()

		const tagDrawer = page.getByRole('dialog', { name: 'Nouvelle étiquette' })
		await expect(tagDrawer).toBeVisible()
		await tagDrawer.getByLabel('Nom', { exact: true }).fill('Urgent')
		await tagDrawer.getByRole('button', { name: 'Valider' }).click()

		await expect(tags.getByText('Urgent')).toBeVisible()
	})

	/**
	 * Le tiroir d'étiquette s'ouvre par-dessus le formulaire de période, qui garde ses
	 * étiquettes en mémoire: sa fermeture ne les rejoue pas. Sans `onupdated`/`ondeleted`,
	 * la puce afficherait encore l'ancien nom, ou une étiquette qui n'existe plus.
	 */
	test("L'édition d'une étiquette suit dans le créneau, sa suppression l'en retire", async () => {
		const tags = page.getByRole('group').filter({ hasText: 'Étiquettes' }).getByRole('combobox')
		await expect(tags.getByText('Urgent')).toBeVisible()

		// Le crayon n'est rendu que sur une étiquette sélectionnée, dans le champ lui-même.
		const editTag = tags.locator('a[href*="form_tag"]')
		await editTag.click()
		// Le titre du tiroir compose « Modifier l' » et « étiquette ».
		const tagDrawer = page.getByRole('dialog', { name: /Modifier l'\s*étiquette/ })
		await expect(tagDrawer).toBeVisible()
		await tagDrawer.getByLabel('Nom', { exact: true }).fill('Urgentissime')
		await tagDrawer.getByRole('button', { name: 'Valider' }).click()

		await expect(tags.getByText('Urgentissime')).toBeVisible()

		await editTag.click()
		await expect(tagDrawer).toBeVisible()
		// `ButtonDelete` demande confirmation avant de porter le `formaction`.
		await tagDrawer.getByRole('button', { name: 'Supprimer' }).click()
		await tagDrawer.getByRole('button', { name: "T'es sur ?" }).click()

		await expect(tags.getByText('Urgentissime')).toBeHidden()
	})

	/**
	 * Un clic seul ne crée plus de période: c'est le survol qui doit annoncer le geste. Le ghost
	 * prend alors la forme d'un trait d'accroche daté, à l'heure aimantée où commencerait le
	 * cliqué-glissé, et seulement là où ce geste crée — jamais sur l'entête de secteur.
	 */
	test('Le survol du plan annonce la création par un trait daté', async () => {
		await gotoPlan('?form_team={}')

		const teamDrawer = page.getByRole('dialog', { name: 'Nouveau secteur' })
		await expect(teamDrawer).toBeVisible()
		await teamDrawer.getByLabel('Nom du secteur').fill('Bar')
		await teamDrawer.getByRole('button', { name: 'Valider' }).click()

		// Un secteur sans période garde une pile vide: la ligne survolable existe malgré tout.
		const row = page.locator('.stack-row').first()
		await expect(row).toBeVisible()
		await row.hover()

		const ghost = page.locator('#ghost_create_period')
		await expect(ghost).toBeVisible()
		await expect(ghost).toHaveText(/^\d{2}:\d{2}$/)

		await page.getByRole('link', { name: 'Bar' }).hover()
		await expect(ghost).toBeHidden()
	})

	/**
	 * Le filtre de secteurs ne vit que dans l'URL: `getPlanData` n'a rien d'autre à lire. Le champ
	 * n'affiche qu'un compte (`countOnly`): un secteur se retire en le décochant dans le menu, et
	 * l'URL doit suivre chaque coche sans attendre la fermeture, qui laissait le plan sur l'ancien
	 * filtre. Le menu, lui, doit survivre à la navigation pour qu'on puisse cocher plusieurs
	 * secteurs de suite.
	 */
	test("Le filtre de secteurs écrit l'URL à chaque changement", async () => {
		await gotoPlan()

		// Le seul combobox du bandeau: les autres contrôles sont des boutons ou des liens.
		const teamsFilter = page.getByRole('combobox')
		await teamsFilter.click()
		await page.getByRole('option', { name: 'Bar' }).click()

		await expect.poll(() => page.url()).toMatch(/teams=/)
		await expect(page.getByRole('listbox')).toBeVisible()
		await expect(teamsFilter).toContainText('1 sélectionné')

		await page.keyboard.press('Escape')
		await expect(page.getByRole('listbox')).toBeHidden()

		await teamsFilter.click()
		await page.getByRole('option', { name: 'Bar' }).click()
		await expect.poll(() => page.url()).not.toMatch(/teams=/)
		await expect(teamsFilter).toContainText('Tous les secteurs')
	})

	/**
	 * Le serveur charge tout créneau qui croise la plage affichée, et un créneau de trois semaines
	 * la déborde des deux côtés. Posé sur ses vraies dates, il élargissait la zone de défilement au
	 * delà de la grille: le bord qui charge la plage suivante n'était plus atteint.
	 */
	test('Un créneau plus long que la plage ne déborde pas de la grille', async () => {
		const team = await seedTeam(event.eventId, 'Camping')
		const period = await seedPeriod(team.id, { inDays: -10, hours: 30 * 24 })

		const grid = await gotoPlan(`?cursor=${new Date().toJSON()}`)
		const card = grid.locator(`[id="${period.id}"]`)
		await expect(card).toBeVisible()
		// Trois semaines ne se lisent pas «08:00 – 08:00»: le libellé porte les jours.
		await expect(card).toContainText(/\d{2}\.\d{2} \d{2}:\d{2} – /)

		const scaleWidth = await grid
			.locator('> div')
			.first()
			.evaluate((el) => (el as HTMLElement).offsetWidth)
		expect(await grid.evaluate((el) => el.scrollWidth)).toBe(scaleWidth)
	})
})
