import { getUserOrRedirect, checkoutLicence } from '$lib/server'

export const load = async ({ url, locals }) => {
	const user = await getUserOrRedirect(url, locals)
	const { clientSecret } = await checkoutLicence.create(user, url)
	return { clientSecret }
}
