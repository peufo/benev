import { expect, type Page } from '@playwright/test'

/**
 * Le marqueur que le layout racine pose une fois hydraté (`src/routes/+layout.svelte`). Avant lui,
 * un clic ne déclenche rien et une saisie est écrasée par le rendu client: l'attendre remplace les
 * boucles qui rejouaient le geste jusqu'à ce qu'il porte.
 *
 * Une navigation client ne le retire pas, la page restant hydratée: seul un `goto` ou un `reload`
 * repart d'un rendu serveur, donc l'attente n'a de sens qu'après ceux-là.
 */
export const awaitHydrated = (page: Page) =>
	expect(page.locator('html[data-hydrated]')).toBeAttached()

/** `goto` suivi de son attente, la forme la plus courante. */
export async function gotoHydrated(page: Page, url: string) {
	const response = await page.goto(url)
	await awaitHydrated(page)
	return response
}
