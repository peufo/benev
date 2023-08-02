import { redirect } from '@sveltejs/kit'

export const load = async ({ locals, route }) => {
	const session = await locals.auth.validate()
	if (!session && route.id !== '/auth') throw redirect(302, '/auth')
	return {
		user: session?.user,
	}
}
