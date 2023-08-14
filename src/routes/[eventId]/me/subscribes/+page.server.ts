import { redirect } from '@sveltejs/kit'
import { getSubscribesData } from '$lib/me/userSubscribes'

export const load = async ({ locals }) => {
	const session = await locals.auth.validate()
	if (!session) throw redirect(300, '/me')
	return await getSubscribesData(session.user.userId)
}
