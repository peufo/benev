import { redirect } from '@sveltejs/kit'

export const load = async ({ locals, route, url }) => {
	const session = await locals.auth.validate()
	if (!session && route.id !== '/me') throw redirect(302, `/me?callback=${url.pathname}`)
	return {
		user: session?.user,
	}
}
