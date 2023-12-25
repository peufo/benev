import { getUserOrRedirect, checkout } from '$lib/server'

export const load = async ({ url, locals }) => {
	const user = await getUserOrRedirect(url, locals)
	const { clientSecret } = await checkout.create(user, url.origin)
	return { clientSecret }
}
