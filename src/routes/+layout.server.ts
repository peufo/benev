import { prisma } from '$lib/server'
import { env } from '$env/dynamic/private'

export const load = async ({ locals }) => {
	const session = await locals.auth.validate()
	if (!session) return {}
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: session.user.id },
	})
	return {
		user,
		userIsRoot: user.email === env.ROOT_USER,
	}
}
