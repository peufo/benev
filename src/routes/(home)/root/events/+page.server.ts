import { z } from 'fuma/validation'
import { parseQuery } from 'fuma/server'
import { prisma } from '$lib/server'
import type { Prisma } from '@prisma/client'

export const load = async ({ url }) => {
	const { search, take, skip } = parseQuery(url, {
		search: z.string().default(''),
		take: z.coerce.number().default(20),
		skip: z.coerce.number().default(0),
	})

	let where: Prisma.EventWhereInput = {}
	if (search) {
		where = {
			OR: [
				{ name: { contains: search } },
				{
					owner: {
						OR: [
							{ firstName: { contains: search } },
							{ lastName: { contains: search } },
							{ email: { contains: search } },
						],
					},
				},
			],
		}
	}
	return {
		events: await prisma.event.findMany({
			take,
			skip,
			orderBy: { createdAt: 'desc' },
			include: {
				owner: true,
				_count: { select: { members: true } },
			},
			where,
		}),
		eventsCount: await prisma.event.count({ where }),
	}
}
