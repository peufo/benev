import { parseQuery } from 'fuma/server'
import { z } from 'fuma/validation'
import { prisma, permission, json } from '$lib/server'

export const GET = async ({ params: { eventId }, url, locals }) => {
	await permission.leader(eventId, locals)

	const data = parseQuery(url, {
		search: z.string().optional(),
		ids: z.filter.multiselect,
		take: z.coerce.number().default(5),
	})

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
