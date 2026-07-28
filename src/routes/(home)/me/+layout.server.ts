import { redirectToAuth } from '$lib/server'
import { NOINDEX } from '$lib/seo'

export const load = async ({ url, parent }) => {
	const { user } = await parent()
	if (!user) throw redirectToAuth(url)
	return { user, metaTags: NOINDEX }
}
