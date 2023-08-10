import { redirect } from '@sveltejs/kit'
import { getData } from '$lib/auth/authSubscribes'

export const load = async ({ locals }) => {
	const session = await locals.auth.validate()
	if (!session) throw redirect(300, '/auth')
	return await getData(session.user.userId)
}
