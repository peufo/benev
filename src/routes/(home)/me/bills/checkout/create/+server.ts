import { json } from '@sveltejs/kit'
import { getUserOrRedirect, createCheckoutSession } from '$lib/server'

export const POST = async ({ url, locals }) => {
	const user = await getUserOrRedirect(url, locals)
	const { clientSecret } = await createCheckoutSession(user, url.origin)
	return json({ clientSecret })
}
