import { scrapLogo } from '$lib/server/scrapLogo'
import { error, json } from '@sveltejs/kit'

export const GET = async ({ url }) => {
	const site = url.searchParams.get('site')
	if (typeof site !== 'string') throw error(400, 'query "site" is required')
	const logo = await scrapLogo(site)
	return json({ logo })
}
