import { parseQuery, prisma } from '$lib/server'
import { z } from '$lib/validation'

export const load = async ({ url }) => {
	const { data, err } = parseQuery(url, {
		skip: z.number().default(0),
		take: z.number().default(20),
	})
	if (err) return err

	return {
		prospects: await prisma.prospect.findMany({
			skip: data.skip,
			take: data.take,
		}),
	}
}
