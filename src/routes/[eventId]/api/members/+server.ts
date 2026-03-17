import { parseQuery } from 'fuma/server'
import { z } from 'fuma/validation'
import { prisma, permission, json } from '$lib/server'

export const GET = async ({ params: { eventId }, url, locals }) => {
	await permission.leader(eventId, locals)

	const data = parseQuery(url, {
		search: z.string().optional(),
		ids: z.jsonArray(z.string()).optional(),
		take: z.coerce.number().default(5),
		anyEvents: z.coerce.boolean(),
	})

	const { search = '', take, ids, anyEvents } = data

	if (ids)
		return json(
			await prisma.member.findMany({
				where: { eventId, id: { in: ids } },
			})
		)

	const eventsId = anyEvents
		? await prisma.member
				.findMany({ where: { isAdmin: true }, select: { eventId: true } })
				.then((members) => members.map((m) => m.eventId))
		: [eventId]

	const members = await prisma.member.findMany({
		where: {
			eventId: { in: eventsId },
			OR: [
				{ lastName: { contains: search } },
				{ firstName: { contains: search } },
				{ email: { contains: search } },
			],
		},
		orderBy: { updatedAt: 'desc' },
		take,
	})

	return json(members)
}
