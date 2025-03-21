import { parseQuery } from 'fuma/server'
import { z } from 'fuma/validation'
import { prisma, permission, json } from '$lib/server'

export const GET = async ({ params: { eventId }, url, locals }) => {
	await permission.leader(eventId, locals)
	const data = parseQuery(url, {
		search: z.string().optional(),
		ids: z.jsonArray(z.string()).optional(),
		take: z.coerce.number().default(5),
	})
	const { search = '', ids, take } = data
	if (ids)
		return json(
			await prisma.tag.findMany({
				where: { eventId, id: { in: ids } },
			})
		)
	const tags = await prisma.tag.findMany({
		where: {
			eventId,
			name: { contains: search },
		},
		take,
	})
	return json(tags)
}
