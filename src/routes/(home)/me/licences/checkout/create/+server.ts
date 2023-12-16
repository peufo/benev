import { json } from '@sveltejs/kit'
import { getUserOrRedirect, checkout } from '$lib/server'

export const POST = async ({ url, locals }) => {
	const user = await getUserOrRedirect(url, locals)
	const { clientSecret } = await checkout.create(user, url.origin)
	return json({ clientSecret })
}
