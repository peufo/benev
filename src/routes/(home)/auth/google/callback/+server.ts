import { error } from '@sveltejs/kit'
import { auth, claimInvite, googleAuth, prisma } from '$lib/server'
import { TERMS_VERSION } from '$lib/constant'

export const GET = async ({ url, cookies, locals }) => {
	const storedState = cookies.get('google_oauth_state')
	const state = url.searchParams.get('state')
	const code = url.searchParams.get('code')

	if (!storedState || !state || !code) error(400, 'Requête OAuth incomplète')
	if (storedState !== state) error(400, 'État OAuth invalide')
	cookies.delete('google_oauth_state', { path: '/' })

	const { getExistingUser, googleUser, createUser } = await googleAuth
		.validateCallback(code)
		.catch(() => error(400, 'Échec de la validation du code OAuth'))

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
				email,
				isEmailVerified: !!googleUser.email_verified,
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
