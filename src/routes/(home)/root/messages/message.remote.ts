import { command, getRequestEvent } from '$app/server'
import { MessageState } from '@prisma/client'
import z from 'zod'
import { permission, prisma } from '$lib/server'

/** Appelé impérativement depuis la liste: un `command()` plutôt qu'un POST axios. */
export const setMessageState = command(
	z.object({ messageId: z.string(), state: z.enum(MessageState) }),
	async ({ messageId, state }) => {
		const { locals } = getRequestEvent()
		await permission.root(locals)
		return prisma.message.update({ where: { id: messageId }, data: { state } })
	}
)
