import { prisma } from '$lib/server'
import { error, json } from '@sveltejs/kit'

export const GET = async ({ url, locals }) => {
	const session = await locals.auth.validate()
	if (!session?.user.isEmailVerified) throw error(401)

	const search = url.searchParams.get('search') || ''
	const users = await prisma.user.findMany({
		where: {
			OR: [
				{ lastName: { contains: search } },
				{ firstName: { contains: search } },
				{ email: { contains: search } },
			],
		},
		select: {
			id: true,
			firstName: true,
			lastName: true,
		},
		take: 5,
	})

	return json(users)
}
