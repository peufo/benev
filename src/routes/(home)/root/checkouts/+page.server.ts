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
		checkouts: await prisma.checkout.findMany({
			...query,
			include: {
				user: true,
				licences: true,
			},
			orderBy: { createdAt: 'desc' },
		}),
	}
}
