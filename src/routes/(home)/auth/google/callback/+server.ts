import { OAuthRequestError } from '@lucia-auth/oauth'
import { error } from '@sveltejs/kit'
import { auth, generateEmail, googleAuth, prisma } from '$lib/server'

export const GET = async ({ url, cookies, locals }) => {
	const storedState = cookies.get('google_oauth_state')
	const state = url.searchParams.get('state')
	const code = url.searchParams.get('code')

	if (!storedState || !state || !code) error(400);
	if (storedState !== state) error(400);

	try {
		const { getExistingUser, googleUser, createUser } = await googleAuth.validateCallback(code)

		const getUser = async () => {
			const existingUser = await getExistingUser()
			if (existingUser) return existingUser
			if (googleUser.email) {
				const dbUser = await prisma.user.findFirst({ where: { email: googleUser.email } })
				if (dbUser) return { ...dbUser, userId: dbUser.id }
			}

			const email = googleUser.email || (await generateEmail())
			const user = await createUser({
				attributes: {
					firstName: googleUser.name.split(' ')[0],
					lastName: googleUser.family_name,
					avatarPlaceholder: googleUser.picture,
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
	} catch (e) {
		if (e instanceof OAuthRequestError) {
			// invalid code
			error(400);
		}
		error(500);
	}
}
