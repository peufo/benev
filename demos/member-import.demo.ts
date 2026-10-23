import { fileURLToPath } from 'node:url'
import { demo, expect } from 'cademo'
import { seedFestival } from './fixtures'
import { gotoHydrated } from '../tests/hydrated'

/**
 * Douze bénévoles tirés d'un tableur. Les en-têtes se reconnaissent tous; seul le régime résiste:
 * `vegetarien` se rattache à « Végétarien » malgré l'accent, mais `végétalien` ne ressemble à
 * aucune option, et c'est à l'organisatrice de dire qu'il veut dire « Végane ».
 */
const CSV = fileURLToPath(new URL('./assets/membres.csv', import.meta.url))

demo('member-import', async ({ page, director }) => {
	const { eventId } = await seedFestival(page, { volunteers: false, fields: true, teams: false })
	await gotoHydrated(page, `/${eventId}/admin/members`)

	await director.start()

	await director.click(page.getByRole('link', { name: 'Importer des membres' }))
	await expect(page.getByRole('heading', { name: 'Depuis un fichier CSV' })).toBeVisible()

	// Le sélecteur de fichiers du système n'est pas filmable: Playwright l'intercepte au clic.
	const chooser = page.waitForEvent('filechooser')
	await director.click(page.getByLabel('Fichier CSV'))
	await (await chooser).setFiles(CSV)
	await page.waitForURL('**/admin/members/import/text')

	const diet = page
		.locator('th')
		.filter({ has: page.getByLabel('Régime alimentaire', { exact: true }) })
	await expect(diet).toContainText('valeurs invalides')
	// Le mappage deviné se lit d'abord en entier: la bulle fera défiler le tableau jusqu'au régime,
	// dernière colonne, et cachera le prénom.
	await director.pause(1000)

	const mapValues = diet.getByRole('button', { name: 'Correspondance' })
	await director.note(mapValues, 'Associe chaque valeur à une option')
	await director.click(mapValues)
	const dialog = page
		.getByRole('dialog')
		.filter({ has: page.getByRole('heading', { name: 'Correspondance des valeurs' }) })
	await expect(dialog).toBeVisible()

	const vegan = dialog.getByRole('listitem').filter({ hasText: 'végétalien' })
	await director.click(vegan.getByRole('button').first())
	await director.click(page.getByRole('option', { name: 'Végane' }))
	await director.click(dialog.getByRole('button', { name: 'Appliquer' }))
	await expect(dialog).toBeHidden()
	await expect(diet).not.toContainText('invalide')
	// Le dialogue rend le focus au bouton « Correspondance », dont l'infobulle resterait à l'écran.
	await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
	// Sans cela, le plan serré du dialogue survit à sa fermeture et ne montre plus que des cellules:
	// la vue entière fait voir la colonne réparée avant l'import.
	await director.focus(null)

	await director.click(page.getByRole('button', { name: 'Importer 12 membres' }))
	await page.waitForURL('**/admin/members/import/report')
	await expect(page.locator('dl > div').filter({ hasText: 'Importés' })).toContainText('12')
	await director.pause(2000)
})
