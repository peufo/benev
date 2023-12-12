import { getCustomerCheckouts, getUserOrRedirect } from '$lib/server'

export const load = async ({ url, locals }) => {
	const user = await getUserOrRedirect(url, locals)

	return {
		checkouts: await getCustomerCheckouts(user),
	}
}
