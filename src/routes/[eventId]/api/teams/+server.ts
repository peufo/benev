import { error, json } from '@sveltejs/kit'
import { prisma, permission, parseQuery } from '$lib/server'
import { z } from '$lib/validation'

export const GET = async ({ params: { eventId }, url, locals }) => {
	await permission.leader(eventId, locals)

	const { err, data } = parseQuery(url, {
		search: z.string().optional(),
		ids: z.array(z.string()).optional(),
		take: z.number().default(5),
	})
	if (err) throw error(400)
	const { search = '', ids, take } = data

	if (ids)
		return json(
			await prisma.team.findMany({
				where: { eventId, id: { in: ids } },
			})
		)

	const teams = await prisma.team.findMany({
		where: {
			eventId,
			name: { contains: search },
		},
		take,
	})

	return json(teams)
}
