import { z } from '$lib/fuma'
import { parseQuery } from '$lib/server/fuma'
import { prisma } from '$lib/server'

export const load = async ({ url }) => {
	const data = parseQuery(url, {
		take: z.coerce.number().default(20),
		skip: z.coerce.number().default(0),
	})

	return {
		checkouts: await prisma.checkout.findMany({
			...data,
			include: {
				user: true,
				products: true,
			},
			orderBy: { createdAt: 'desc' },
		}),
	}
}
