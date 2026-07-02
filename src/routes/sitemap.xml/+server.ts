import { prisma } from '$lib/server'

const staticPaths = ['/', '/events', '/open-source', '/terms', '/contact']

export async function GET({ url }) {
	const origin = url.origin
	const staticsPages = staticPaths.map((path) => urlElement(origin, path))

	const events = await prisma.event.findMany({
		where: { state: 'published', deletedAt: null },
		include: { pages: { select: { path: true, type: true, updatedAt: true } } },
	})

	const eventsSiteMap = events
		.map((event) => {
			const basePath = `/${event.id}`
			const homePage = event.pages.find((p) => p.type === 'home')
			if (!homePage) return ''
			const indexUrlElement = urlElement(origin, basePath, homePage.updatedAt)
			const teamsUrlElement = urlElement(origin, basePath + '/teams', event.updatedAt)
			const pagesUrlElement = event.pages
				.filter((p) => p.type === 'public' || p.type === 'charter')
				.map((p) => urlElement(origin, `${basePath}/${p.path}`, p.updatedAt))
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
