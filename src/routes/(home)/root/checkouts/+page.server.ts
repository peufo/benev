import { z } from 'fuma/validation'
import { parseQuery } from 'fuma/server'
import { prisma } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async ({ url }) => {
	const data = parseQuery(url, {
		take: z.number().default(20),
		skip: z.number().default(0),
	})

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
