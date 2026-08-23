import { prisma } from '$lib/server'
import { resolve } from '$app/paths'

const staticPaths = [
	'/',
	'/events',
	'/events/past',
	'/open-source',
	'/contact',
	'/terms',
	'/privacy',
	'/legal-notice',
	'/sales-terms',
]

export async function GET({ url }) {
	const origin = url.origin
	// `resolve` rend un chemin relatif à la requête courante tant que `paths.relative` vaut son
	// défaut: seule une résolution contre l'URL de la requête en tire l'absolu qu'attend un sitemap.
	const absolute = (path: string) => new URL(path, url).pathname
	const staticsPages = staticPaths.map((path) => urlElement(origin, path))

	const events = await prisma.event.findMany({
		where: { state: 'published', deletedAt: null },
		include: { pages: { select: { path: true, type: true, updatedAt: true } } },
	})

	const eventsSiteMap = events
		.map((event) => {
			const homePage = event.pages.find((p) => p.type === 'home')
			if (!homePage) return ''
			const indexUrlElement = urlElement(
				origin,
				absolute(resolve('/[eventId]', { eventId: event.id })),
				homePage.updatedAt
			)
			// Sans inscription libre, /teams répond 401 aux visiteurs anonymes
			const teamsUrlElement = event.selfSubscribeAllowed
				? urlElement(
						origin,
						absolute(resolve('/[eventId]/teams', { eventId: event.id })),
						event.updatedAt
					)
				: ''
			const pagesUrlElement = event.pages
				.filter((p) => p.type === 'public' || p.type === 'charter')
				.map((p) =>
					urlElement(
						origin,
						absolute(resolve('/[eventId]/[pagePath]', { eventId: event.id, pagePath: p.path })),
						p.updatedAt
					)
				)
			return [indexUrlElement, teamsUrlElement, ...pagesUrlElement].join('')
		})
		.join('')

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticsPages.join('\n')}
${eventsSiteMap}
</urlset>`,
		{ headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
	)
}

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}

function urlElement(origin: string, pathname: string, updatedAt?: Date) {
	const loc = `<loc>${escapeXml(origin + pathname)}</loc>`
	const lastMod = updatedAt ? `<lastmod>${updatedAt.toISOString()}</lastmod>` : ''
	return `<url>${loc}${lastMod}</url>`
}
