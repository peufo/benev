import { z } from 'zod'
import { parseQuery, prisma } from '$lib/server'

export const load = async ({ url }) => {
	const { take, skip } = parseQuery(
		url,
		z.object({ take: z.coerce.number().default(20), skip: z.coerce.number().default(0) })
	)
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
