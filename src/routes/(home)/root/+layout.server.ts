import { ROOT_USER } from '$env/static/private'
import { error } from '@sveltejs/kit'

export const load = async ({ locals }) => {
	const session = await locals.auth.validate()
	if (session?.user.email !== ROOT_USER) error(401, "You'r not root user");
}
