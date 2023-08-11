import { redirect } from '@sveltejs/kit'
import { getData } from '$lib/me/authSubscribes'

export const load = async ({ locals }) => {
	const session = await locals.auth.validate()
	if (!session) throw redirect(300, '/me')
	return await getData(session.user.userId)
}
