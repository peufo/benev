import { z } from 'fuma/validation'
import { parseQuery } from 'fuma/server'
import { prisma } from '$lib/server'
import type { Prisma } from '@prisma/client'

export const load = async ({ url }) => {
	const { search, take, skip, sort, order } = parseQuery(url, {
		search: z.string().default(''),
		take: z.coerce.number().default(20),
		skip: z.coerce.number().default(0),
		sort: z.enum(['events', 'members']).optional(),
		order: z.enum(['asc', 'desc']).default('desc'),
	})

	let where: Prisma.UserWhereInput = {}
	if (search) {
		where = {
			OR: [
				{ firstName: { contains: search } },
				{ lastName: { contains: search } },
				{ email: { contains: search } },
			],
		}
	}

	const orderBy: Prisma.UserOrderByWithRelationInput[] = [{ createdAt: 'desc' }]
	if (sort === 'events') orderBy.unshift({ events: { _count: order } })
	if (sort === 'members') orderBy.unshift({ members: { _count: order } })

	return {
		usersCount: await prisma.user.count({ where }),
		users: await prisma.user.findMany({
			where,
			include: {
				auth_key: true,
				members: {
					include: { event: true },
				},
				_count: { select: { members: true, events: true } },
			},
			orderBy,
			take,
			skip,
		}),
	}
}
