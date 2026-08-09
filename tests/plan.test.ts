import { expect, test, type Page } from '@playwright/test'
import { useUser } from './user'
import { useEvent } from './event'

test.describe.serial('Plan', () => {
	const zoe = useUser('Zoe')
	const event = useEvent(zoe, 'Zoom')
	let page: Page

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
		await zoe.register(page)
		await event.create(page)
	})
	test.afterAll(async () => {
		await page.close()
	})

	/**
	 * Le plan est rendu côté serveur: ses contrôles existent à l'écran avant d'être actifs, et un
	 * clic ou une molette arrivés trop tôt ne déclenchent rien. Il se recentre sur son curseur une
	 * fois hydraté: c'est le signal que les écouteurs sont posés. Rend la grille, qui porte le
	 * défilement et dont la largeur suit l'échelle.
	 */
	async function gotoPlan(query = '') {
		await page.goto(`/${event.eventId}/admin/plan${query}`)
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
	test('Une étiquette créée depuis une période y est sélectionnée', async () => {
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
})
