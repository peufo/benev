import { validateToken } from '$lib/server'
import { auth } from '$lib/server'
import { error, redirect } from '@sveltejs/kit'

export const GET = async ({ params, locals }) => {
	try {
		const userId = await validateToken('emailVerification', params.tokenId)
		const user = await auth.getUser(userId)
		await auth.invalidateAllUserSessions(user.id)
		await auth.updateUserAttributes(user.id, {
			isEmailVerified: true,
		})
		const session = await auth.createSession({ userId, attributes: {} })
		locals.auth.setSession(session)
	} catch {
		throw error(401, 'Invalid token')
	} finally {
		throw redirect(302, '/me/profile')
	}
}
