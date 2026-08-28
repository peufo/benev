import { getInvite, prisma } from '$lib/server'
import { ROOT_USER } from '$app/env/private'

export const load = async ({ locals, cookies }) => {
	// Le seul endroit que partagent `/auth` et `[eventId]/register`, les deux pages où `Login` est
	// monté. Sans cookie d'invitation, l'appel s'arrête à la lecture du cookie.
	const invite = await getInvite(cookies)
	const session = await locals.auth.validate()
	if (!session) return { invite }
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: session.user.id },
	})
	return {
		invite,
		user,
		userIsRoot: user.email === ROOT_USER,
	}
}
