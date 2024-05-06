import { z } from 'fuma/validation'
import { parseQuery } from 'fuma/server'
import { prisma } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async ({ url }) => {
	const query = parseQuery(url, {
		take: z.number().default(20),
		skip: z.number().default(0),
	})

	return {
		usersCount: await prisma.user.count(),
		users: await prisma.user.findMany({
			...query,
			include: {
				licences: true,
				_count: { select: { members: true, events: true } },
			},
			orderBy: { createdAt: 'desc' },
		}),
	}
}
