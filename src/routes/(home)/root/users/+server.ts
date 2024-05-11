import { z } from 'fuma/validation'
import { parseQuery } from 'fuma/server'
import { json, permission, prisma } from '$lib/server'

export const GET = async ({ locals, url }) => {
	await permission.root(locals)

	const { search, take } = parseQuery(url, {
		search: z.string().default(''),
		take: z.coerce.number().default(5),
	})

	const users = await prisma.user.findMany({
		take,
		where: {
			OR: [
				{ firstName: { contains: search } },
				{ lastName: { contains: search } },
				{ email: { contains: search } },
			],
		},
	})

	return json(users)
}
