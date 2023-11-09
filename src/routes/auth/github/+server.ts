import { dev } from '$app/environment'
import { githubAuth } from '$lib/server/lucia.js'
import { redirect } from '@sveltejs/kit'

export const GET = async ({ cookies }) => {
	const [url, state] = await githubAuth.getAuthorizationUrl()
	cookies.set('github_oauth_state', state, {
		httpOnly: true,
		secure: !dev,
		path: '/',
		maxAge: 60 * 60,
	})
	throw redirect(302, url.toString())
}
