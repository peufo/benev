import { z } from '$lib/validation'
import { parseQuery, prisma } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async ({ url }) => {
	const { data, err } = parseQuery(url, {
		take: z.number().default(20),
		skip: z.number().default(0),
	})
	if (err) error(400);
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
