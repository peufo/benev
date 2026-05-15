import { getUserOrRedirect, checkoutDonation } from '$lib/server'

export const load = async ({ url, locals }) => {
	const user = await getUserOrRedirect(url, locals)
	const { clientSecret } = await checkoutDonation.create(user, url)
	return { clientSecret }
}
