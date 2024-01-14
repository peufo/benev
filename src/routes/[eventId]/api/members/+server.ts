import { error } from '@sveltejs/kit'
import { prisma, permission, parseQuery, json } from '$lib/server'
import { z } from '$lib/validation'

export const GET = async ({ params: { eventId }, url, locals }) => {
	await permission.leader(eventId, locals)

	const { err, data } = parseQuery(url, {
		search: z.string().optional(),
		ids: z.array(z.string()).optional(),
		take: z.number().default(5),
	})
	if (err) error(400);
	const { search = '', take, ids } = data

	if (ids)
		return json(
			await prisma.member.findMany({
				where: { eventId, id: { in: ids } },
			})
		)

	const members = await prisma.member.findMany({
		where: {
			eventId,
			user: {
				OR: [
					{ lastName: { contains: search } },
					{ firstName: { contains: search } },
					{ email: { contains: search } },
				],
			},
		},
		select: {
			id: true,
			user: {
				select: {
					firstName: true,
					lastName: true,
					email: true,
				},
			},
		},
		take,
	})

	return json(members)
}
