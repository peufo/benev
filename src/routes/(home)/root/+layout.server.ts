import { ROOT_USER } from '$app/env/private'
import { error } from '@sveltejs/kit'
import { NOINDEX } from '#lib/seo/index.js'

export const load = async ({ locals }) => {
	const session = await locals.auth.validate()
	if (session?.user.email !== ROOT_USER) error(401, "Réservé à l'équipe benevio")
	return { metaTags: NOINDEX }
}
