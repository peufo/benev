import { test, type Page } from '@playwright/test'

/**
 * Une page ouverte avant la première étape du `describe` et fermée après la dernière: dans un
 * `describe.serial`, la session et l'état de l'interface passent ainsi d'une étape à l'autre.
 * Chaque appel ouvre son propre contexte, sans cookie partagé avec les autres pages.
 *
 * Playwright n'a pas de fixture à la portée d'un `describe`, et une fixture de worker survivrait
 * d'un fichier au suivant. La page n'existant qu'au `beforeAll`, ce qui est rendu tout de suite
 * est un relais vers elle. `constructor` passe tel quel: les matchers de `expect` reconnaissent
 * une `Page` à son nom.
 */
export function sharedPage(): Page {
	let page: Page | undefined
	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage()
	})
	test.afterAll(async () => {
		await page?.close()
	})
	return new Proxy({} as Page, {
		get(_, key) {
			if (!page) throw new Error('Page partagée lue hors des étapes de son describe')
			const value = Reflect.get(page, key)
			return typeof value === 'function' && key !== 'constructor' ? value.bind(page) : value
		},
	})
}
