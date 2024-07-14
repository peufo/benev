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

	return {
		usersCount: await prisma.user.count({ where }),
		users: await prisma.user.findMany({
			where,
			include: {
				licences: true,
				auth_key: true,
				members: {
					include: { event: true },
				},
				_count: { select: { members: true, events: true } },
			},
			orderBy: { createdAt: 'desc' },
			take,
			skip,
		}),
	}
}
