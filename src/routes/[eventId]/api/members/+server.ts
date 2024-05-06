import { error } from '@sveltejs/kit'
import { parseQuery } from 'fuma/server'
import { z } from 'fuma/validation'
import { prisma, permission, json } from '$lib/server'

export const GET = async ({ params: { eventId }, url, locals }) => {
	await permission.leader(eventId, locals)

	const { search, ids, take } = parseQuery(url, {
		search: z.string().default(''),
		ids: z.array(z.string()).optional(),
		take: z.number().default(5),
	})

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
