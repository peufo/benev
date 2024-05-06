import { z } from 'fuma/validation'
import { parseQuery } from 'fuma/server'
import { json, permission, prisma } from '$lib/server'
import { error } from '@sveltejs/kit'

export const GET = async ({ locals, url }) => {
	await permission.root(locals)

	const { err, data } = parseQuery(url, {
		search: z.string().optional(),
		take: z.number().default(5),
	})
	if (err) error(400)
	const { search = '', take } = data

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
