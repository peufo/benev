import { parseFormData } from 'fuma/server'
import { z } from 'fuma/validation'
import { validateToken } from '$lib/server'
import { auth } from '$lib/server'
import { error, fail, redirect } from '@sveltejs/kit'

export const actions = {
	default: async ({ params, locals, request }) => {
		const { data } = await parseFormData(request, {
			password: z.string().min(8),
			redirectTo: z.string().optional(),
		}).catch((err) => fail(400, err.issues))

		try {
			const userId = await validateToken('passwordReset', params.tokenId)
			const user = await auth.getUser(userId)
			await auth.invalidateAllUserSessions(user.id)
			await auth.updateKeyPassword('email', user.email, data.password)
			if (!user.isEmailVerified) {
				await auth.updateUserAttributes(user.id, {
					isEmailVerified: true,
				})
			}

			const session = await auth.createSession({ userId, attributes: {} })
			locals.auth.setSession(session)
		} catch {
			error(401, 'Invalid token')
		} finally {
			if (data.redirectTo) redirect(302, data.redirectTo)
			redirect(302, '/me')
		}
	},
}
