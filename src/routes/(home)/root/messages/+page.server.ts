import { error } from '@sveltejs/kit'
import { parseFormData, parseQuery, prisma, tryOrFail } from '$lib/server'
import { toTuple, z } from '$lib/validation'
import { MessageState, type Prisma } from '@prisma/client'

export const load = async ({ url }) => {
	const { data, err } = parseQuery(url, {
		skip: z.number().default(0),
		take: z.number().default(20),
		state: z.enum(toTuple(MessageState)).optional(),
	})
	if (err) throw error(400)

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
		const { data, err } = await parseFormData(request, {
			messageId: z.string(),
			state: z.enum(toTuple(MessageState)),
		})
		if (err) return err

		return tryOrFail(() =>
			prisma.message.update({
				where: { id: data.messageId },
				data: { state: data.state },
			})
		)
	},
}
