import { prisma } from '$lib/server'

const staticsPages: string[] = [urlElement('/')]

export async function GET() {
	const events = await prisma.event.findMany({
		where: { state: 'actived', deletedAt: null },
		include: { pages: { select: { path: true, isIndex: true, updatedAt: true } } },
	})

	const eventsSiteMap = events
		.map((event) => {
			const basePath = `/${event.id}`
			const index = event.pages.find((p) => p.isIndex)
			if (!index) return ''
			const indexUrlElement = urlElement(basePath, index.updatedAt)
			const teamsUrlElement = urlElement(basePath + '/teams')
			const pagesUrlElement = event.pages
				.filter((p) => !p.isIndex)
				.map((p) => urlElement(`${basePath}/${p.path}`, p.updatedAt))
			return [indexUrlElement, teamsUrlElement, ...pagesUrlElement].join('')
		})
		.join('')

	return new Response(
		`<?xml version="1.0" encoding="UTF-8" ?>
    <urlset
      xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xhtml="https://www.w3.org/1999/xhtml"
      xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
    >	
      ${staticsPages}
      ${eventsSiteMap}
    </urlset>`.trim(),
		{ headers: { 'Content-Type': 'application/xml' } }
	)
}

function urlElement(pathname: string, updatedAt?: Date) {
	const loc = `<loc>https://benev.io${pathname}</loc>`
	const lastMod = updatedAt ? `<lastmod>${updatedAt.toJSON()}</lastmod>` : ''
	return `<url>${loc + lastMod}</url>`
}
