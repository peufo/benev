import { OAuthRequestError } from '@lucia-auth/oauth'
import { error, redirect } from '@sveltejs/kit'
import { auth, githubAuth, prisma } from '$lib/server'

export const GET = async ({ url, cookies, locals }) => {
	const storedState = cookies.get('github_oauth_state')
	const state = url.searchParams.get('state')
	const code = url.searchParams.get('code')

	if (!storedState || !state || !code) throw error(400)
	if (storedState !== state) throw error(400)

	try {
		const { getExistingUser, githubUser, createUser } = await githubAuth.validateCallback(code)

		const getUser = async () => {
			const existingUser = await getExistingUser()
			if (existingUser) return existingUser
			if (githubUser.email) {
				const dbUser = await prisma.user.findFirst({ where: { email: githubUser.email } })
				if (dbUser) return { ...dbUser, userId: dbUser.id }
			}

			const email = githubUser.email || `${githubUser.login}@benev.io`
			const firstName = githubUser.name?.split(' ')[0] || githubUser.login
			const lastName = githubUser.name?.split(' ')[1] || githubUser.login
			const user = await createUser({
				attributes: {
					firstName,
					lastName,
					avatarPlaceholder: githubUser.avatar_url,
					email,
					isEmailVerified: !!githubUser.email,
				},
			})
			return user
		}

		const user = await getUser()
		const session = await auth.createSession({
			userId: user.id,
			attributes: {},
		})
		locals.auth.setSession(session)
		return new Response(null, {
			status: 302,
			headers: { Location: '/me' },
		})
	} catch (e) {
		if (e instanceof OAuthRequestError) {
			// invalid code
			throw error(400)
		}
		throw error(500)
	}
}
