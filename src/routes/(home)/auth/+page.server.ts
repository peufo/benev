import { redirect } from '@sveltejs/kit'
import { NOINDEX_FOLLOW, pageMetaTags } from '$lib/seo'

export const load = async ({ locals, url }) => {
	const session = await locals.auth.validate()
	const redirectTo = url.searchParams.get('redirectTo')
	if (session && redirectTo) redirect(302, redirectTo)
	if (session) redirect(302, '/me')
	return {
		metaTags: pageMetaTags({ title: 'Connexion', ...NOINDEX_FOLLOW }),
	}
}
