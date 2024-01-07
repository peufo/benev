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
		licences: await prisma.licence.findMany({
			...data,
			include: {
				owner: true,
			},
			orderBy: { createdAt: 'desc' },
		}),
	}
}
