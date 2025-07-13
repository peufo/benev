import { OAuthRequestError } from '@lucia-auth/oauth'
import { error } from '@sveltejs/kit'
import { auth, googleAuth, prisma } from '$lib/server'

export const GET = async ({ url, cookies, locals }) => {
	const storedState = cookies.get('google_oauth_state')
	const state = url.searchParams.get('state')
	const code = url.searchParams.get('code')

	if (!storedState || !state || !code) error(400)
	if (storedState !== state) error(400)

	const { getExistingUser, googleUser, createUser } = await googleAuth
		.validateCallback(code)
		.catch(() => error(400))

	const getUser = async () => {
		const existingUser = await getExistingUser()
		if (existingUser) return existingUser

		const { email } = googleUser
		if (!email) error(403, 'You need provide an email from your Google account')

		const userAlreadyExist = await prisma.user.findFirst({ where: { email } })
		if (userAlreadyExist) return userAlreadyExist

		const user = await createUser({
			attributes: {
				firstName: googleUser.name.split(' ')[0],
				lastName: googleUser.family_name,
				avatarPlaceholder: googleUser.picture,
				isHeadlessAccount: false,
				email,
				isEmailVerified: !!googleUser.email_verified,
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
