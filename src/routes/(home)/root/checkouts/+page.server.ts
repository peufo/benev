import { z } from 'fuma/validation'
import { parseQuery } from 'fuma/server'
import { prisma } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async ({ url }) => {
	const { data, err } = parseQuery(url, {
		take: z.number().default(20),
		skip: z.number().default(0),
	})
	if (err) error(400)

	return {
		checkouts: await prisma.checkout.findMany({
			...data,
			include: {
				user: true,
				licences: true,
			},
			orderBy: { createdAt: 'desc' },
		}),
	}
}
