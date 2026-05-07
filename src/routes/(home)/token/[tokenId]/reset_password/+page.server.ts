import { formAction } from 'fuma/server'
import { z } from 'fuma/validation'
import { validateToken } from '$lib/server'
import { auth } from '$lib/server'

export const actions = {
	default: formAction(
		{
			password: z.string().min(8),
			redirectTo: z.string().optional(),
		},
		async ({ data, locals, params }) => {
			const userId = await validateToken('passwordReset', params.tokenId)
			const user = await auth.getUser(userId)

			await auth.invalidateAllUserSessions(user.id)
			await auth.deleteKey('email', user.email)
			await auth.createKey({
				userId: user.id,
				providerId: 'email',
				password: data.password,
				providerUserId: user.email,
			})
			if (!user.isEmailVerified) {
				await auth.updateUserAttributes(user.id, {
					isEmailVerified: true,
				})
			}

			const session = await auth.createSession({ userId, attributes: {} })
			locals.auth.setSession(session)
			return data.redirectTo || '/me'
		},
		{ redirectTo: (url) => url }
	),
}
