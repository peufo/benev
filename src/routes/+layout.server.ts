import { prisma } from '$lib/server'
import { ROOT_USER } from '$env/static/private'

export const load = async ({ locals }) => {
	const session = await locals.auth.validate()
	if (!session) return {}
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: session.user.id },
	})
	return {
		user,
		userIsRoot: user.email === ROOT_USER,
	}
}
