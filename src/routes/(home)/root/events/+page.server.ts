import { z } from 'fuma/validation'
import { parseQuery } from 'fuma/server'
import { prisma } from '$lib/server'

export const load = async ({ url }) => {
	const data = parseQuery(url, {
		take: z.coerce.number().default(20),
		skip: z.coerce.number().default(0),
	})

	return {
		events: await prisma.event.findMany({
			take: data.take,
			skip: data.skip,
			include: {
				owner: true,
				_count: { select: { members: true } },
			},
		}),
	}
}
