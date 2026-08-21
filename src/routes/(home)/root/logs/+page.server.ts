import { parseQuery } from 'fuma/server'
import z from 'zod'
import { prisma } from '$lib/server'
import { LogType, type Prisma } from '@prisma/client'

export const load = async ({ url }) => {
	const data = parseQuery(url, {
		skip: z.coerce.number().default(0),
		take: z.coerce.number().default(20),
		type: z.enum(LogType).optional(),
	})

	const where: Prisma.LogWhereInput = {}
	if (data.type) where.type = data.type

	return {
		logs: await prisma.log.findMany({
			where,
			orderBy: { createdAt: 'desc' },
			take: data.take,
			skip: data.skip,
			include: {
				event: { select: { id: true, name: true } },
				user: { select: { firstName: true, lastName: true } },
			},
		}),
	}
}
