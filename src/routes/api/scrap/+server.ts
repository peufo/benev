import { scrapIcon } from '$lib/server/scrapLogo'
import { error } from '@sveltejs/kit'
import { json } from '$lib/server'

export const GET = async ({ url }) => {
	const site = url.searchParams.get('site')
	if (typeof site !== 'string') throw error(400, 'query "site" is required')
	const icon = await scrapIcon(site)
	return json({ icon })
}
