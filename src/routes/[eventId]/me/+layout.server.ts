import { redirect } from '@sveltejs/kit'

export const load = async ({ locals, url }) => {
	const session = await locals.auth.validate()

	const callback = url.searchParams.get('callback')
	if (session && callback) throw redirect(301, callback)
}
