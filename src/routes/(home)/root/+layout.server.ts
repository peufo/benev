import { env } from '$env/dynamic/private'
import { error } from '@sveltejs/kit'

export const load = async ({ locals }) => {
	const session = await locals.auth.validate()
	if (session?.user.email !== env.ROOT_USER) error(401, "You'r not root user")
}
