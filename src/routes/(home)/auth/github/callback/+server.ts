import { OAuthRequestError } from '@lucia-auth/oauth'
import { error } from '@sveltejs/kit'
import { auth, githubAuth, prisma } from '$lib/server'

export const GET = async ({ url, cookies, locals }) => {
	const storedState = cookies.get('github_oauth_state')
	const state = url.searchParams.get('state')
	const code = url.searchParams.get('code')

	if (!storedState || !state || !code) error(400)
	if (storedState !== state) error(400)

	const { getExistingUser, githubUser, createUser } = await githubAuth
		.validateCallback(code)
		.catch(() => error(400))

	const getUser = async () => {
		const existingUser = await getExistingUser()
		if (existingUser) return existingUser
		const { email } = githubUser
		if (!email) error(403, 'You need provide an email from your Github account')

		const userAlreadyExist = await prisma.user.findFirst({ where: { email } })
		if (userAlreadyExist) return userAlreadyExist

		const firstName = githubUser.name?.split(' ')[0] || githubUser.login
		const lastName = githubUser.name?.split(' ')[1] || ''
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
}
