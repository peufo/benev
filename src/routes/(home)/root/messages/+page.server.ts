import { parseQuery } from 'fuma/server'
import { toTuple, z } from '$lib/fuma-legacy/validation'
import { prisma } from '$lib/server'
import { MessageState, type Prisma } from '@prisma/client'

export const load = async ({ url }) => {
	const data = parseQuery(url, {
		skip: z.coerce.number().default(0),
		take: z.coerce.number().default(20),
		state: z.enum(toTuple(MessageState)).optional(),
	})

	const where: Prisma.MessageWhereInput = {}
	if (data.state) where.state = data.state

	return {
		messages: await prisma.message.findMany({
			where,
			orderBy: { createdAt: 'asc' },
			take: data.take,
			skip: data.skip,
			include: {
				author: true,
			},
		}),
	}
}
