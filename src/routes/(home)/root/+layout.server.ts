import { env } from '$env/dynamic/private'
import { error } from '@sveltejs/kit'
import { NOINDEX } from '$lib/seo'

export const load = async ({ locals }) => {
	const session = await locals.auth.validate()
	if (session?.user.email !== env.ROOT_USER) error(401, "You'r not root user")
	return { metaTags: NOINDEX }
}
