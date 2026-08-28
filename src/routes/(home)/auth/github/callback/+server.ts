import { error } from '@sveltejs/kit'
import { auth, claimInvite, githubAuth, prisma } from '$lib/server'
import { TERMS_VERSION } from '$lib/constant'

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
				isTermsAccepted: true,
				termsVersion: TERMS_VERSION,
				termsAcceptedAt: new Date(),
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

	// Le cookie d'invitation est ce qui la fait survivre à l'aller-retour chez le fournisseur:
	// l'invité repart vers son évènement, et non vers son tableau de bord.
	const invite = await claimInvite(cookies, session.user)
	return new Response(null, {
		status: 302,
		headers: { Location: invite ? `/${invite.eventId}/register` : '/me' },
	})
}
