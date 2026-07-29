import { form, getRequestEvent } from '$app/server'
import { redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { auth, validateToken } from '$lib/server'

// SvelteKit réécrit `url.pathname` avec la route appelante avant de rejouer le
// matching: `params` porte donc bien les paramètres de la page.
export const resetPassword = form(
	z.object({
		password: z.string().min(8),
		redirectTo: z.string().optional(),
	}),
	async ({ password, redirectTo }) => {
		const { locals, params } = getRequestEvent()
		const tokenId = params.tokenId!
		const userId = await validateToken('passwordReset', tokenId)
		const user = await auth.getUser(userId)

		await auth.invalidateAllUserSessions(user.id)
		await auth.deleteKey('email', user.email)
		await auth.createKey({
			userId: user.id,
			providerId: 'email',
			password,
			providerUserId: user.email,
		})
		if (!user.isEmailVerified) {
			await auth.updateUserAttributes(user.id, { isEmailVerified: true })
		}

		const session = await auth.createSession({ userId, attributes: {} })
		locals.auth.setSession(session)
		redirect(303, redirectTo || '/me')
	}
)
