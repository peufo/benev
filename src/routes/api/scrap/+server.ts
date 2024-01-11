import { scrapIcon } from '$lib/server/scrapLogo'
import { error, json } from '@sveltejs/kit'

export const GET = async ({ url }) => {
	const site = url.searchParams.get('site')
	if (typeof site !== 'string') throw error(400, 'query "site" is required')
	const icon = await scrapIcon(site)
	return json({ icon })
}
