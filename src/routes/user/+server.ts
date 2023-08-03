import { prisma } from '$lib/server'
import { json } from '@sveltejs/kit'

export const GET = async ({ url }) => {
	const search = url.searchParams.get('search') || ''
	const users = await prisma.user.findMany({
		where: {
			OR: [
				{ lastName: { contains: search } },
				{ firstName: { contains: search } },
				{ email: { contains: search } },
			],
		},
	})

	return json(users)
}
