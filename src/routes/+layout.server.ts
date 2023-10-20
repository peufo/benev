import { prisma } from '$lib/server'

export const load = async ({ locals }) => {
	const session = await locals.auth.validate()
	if (!session) return {}
	return {
		user: prisma.user.findUniqueOrThrow({
			where: { id: session.user.id },
		}),
	}
}
