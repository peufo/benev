import { z } from '$lib/validation'
import { parseQuery, prisma } from '$lib/server'

export const load = async ({ url }) => {
	const { take, skip } = parseQuery(url, {
		take: z.number().default(20),
		skip: z.number().default(0),
	})
	return {
		events: await prisma.event.findMany({
			take,
			skip,
			include: {
				owner: true,
				_count: { select: { members: true } },
			},
		}),
	}
}
