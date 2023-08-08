import { redirect } from '@sveltejs/kit'
import { prisma } from '$lib/server'

export const load = async ({ locals }) => {
	const session = await locals.auth.validate()
	if (!session) throw redirect(300, '/auth')
	return {
		user: await prisma.user.findFirstOrThrow({
			where: { id: session.user.userId },
		}),
	}
}
