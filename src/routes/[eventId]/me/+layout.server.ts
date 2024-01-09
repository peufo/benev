import { redirectToAuth } from '$lib/server'

export const load = async ({ url, parent }) => {
	const { user } = await parent()
	if (!user) throw redirectToAuth(url)
	return { user }
}
