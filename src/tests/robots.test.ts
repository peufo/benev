import { describe, it } from 'vitest'
import { GET } from '../routes/robots.txt/+server'

/**
 * Le fichier statique `static/robots.txt` a laissé place à une route: la production doit
 * continuer à servir exactement les mêmes règles, et les autres domaines — `dev.benev.io`
 * en tête — ne doivent jamais être indexables, sous peine de dupliquer tout le site.
 */
const robots = async (url: string) => {
	const response = await GET({ url: new URL(url) } as Parameters<typeof GET>[0])
	return response.text()
}

describe('robots.txt', () => {
	it('ouvre la production au crawl et déclare son sitemap', async ({ expect }) => {
		const body = await robots('https://benev.io/robots.txt')
		expect(body).toContain('Allow: /')
		expect(body).toContain('Disallow: /*/admin')
		expect(body).toContain('Sitemap: https://benev.io/sitemap.xml')
		expect(body).not.toMatch(/^Disallow: \/$/m)
	})

	it('ferme les autres domaines', async ({ expect }) => {
		for (const url of ['https://dev.benev.io/robots.txt', 'http://localhost:4173/robots.txt']) {
			const body = await robots(url)
			expect(body).toMatch(/^Disallow: \/$/m)
			expect(body).not.toContain('Sitemap:')
		}
	})
})
