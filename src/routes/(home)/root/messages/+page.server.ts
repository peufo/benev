import { error } from '@sveltejs/kit'
import { tryOrFail, parseFormData, parseQuery } from 'fuma/server'
import { toTuple, z } from 'fuma/validation'
import { prisma } from '$lib/server'
import { MessageState, type Prisma } from '@prisma/client'

export const load = async ({ url }) => {
	const { data, err } = parseQuery(url, {
		skip: z.number().default(0),
		take: z.number().default(20),
		state: z.enum(toTuple(MessageState)).optional(),
	})
	if (err) error(400)

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

export const actions = {
	set_state: async ({ request }) => {
		return tryOrFail(async () => {
			const { data } = await parseFormData(request, {
				messageId: z.string(),
				state: z.enum(toTuple(MessageState)),
			})

			return prisma.message.update({
				where: { id: data.messageId },
				data: { state: data.state },
			})
		})
	},
}
