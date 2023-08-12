import { validateEmailVerificationToken } from '$lib/server/emailToken.js'
import { auth } from '$lib/server'
import { error, redirect } from '@sveltejs/kit'

export const GET = async ({ params, locals }) => {
	try {
		console.log('LOAD')
		const userId = await validateEmailVerificationToken(params.tokenId)
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
		throw redirect(301, '/me/profile')
	}
}
