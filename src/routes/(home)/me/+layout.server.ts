import { redirectToAuth } from '#lib/server/index.js'
import { NOINDEX } from '#lib/seo/index.js'

export const load = async ({ url, parent }) => {
	const { user } = await parent()
	if (!user) throw redirectToAuth(url)
	return { user, metaTags: NOINDEX }
}
