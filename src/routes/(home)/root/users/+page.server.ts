import { z } from '$lib/validation'
import { parseQuery, prisma } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async ({ url }) => {
	const { data, err } = parseQuery(url, {
		take: z.number().default(20),
		skip: z.number().default(0),
	})
	if (err) throw error(400)
	return {
		usersCount: await prisma.user.count(),
		users: await prisma.user.findMany({
			take: data.take,
			skip: data.skip,
			include: {
				licences: true,
				_count: { select: { members: true, events: true } },
			},
			orderBy: { createdAt: 'desc' },
		}),
	}
}
