import { scrapIcon } from '#lib/server/scrapLogo.js'
import { error } from '@sveltejs/kit'

export const GET = async ({ url }) => {
	const site = url.searchParams.get('site')
	if (typeof site !== 'string') error(400, 'Le paramètre site est requis')
	const icon = await scrapIcon(site)
	return Response.json({ icon })
}
