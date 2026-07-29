import { command, getRequestEvent } from '$app/server'
import { MessageState } from '@prisma/client'
import z from 'zod'
import { permission, prisma } from '$lib/server'
import { toTuple } from '$lib/fuma-legacy/validation'

/** Appelé impérativement depuis la liste: un `command()` plutôt qu'un POST axios. */
export const setMessageState = command(
	z.object({ messageId: z.string(), state: z.enum(toTuple(MessageState)) }),
	async ({ messageId, state }) => {
		const { locals } = getRequestEvent()
		await permission.root(locals)
		return prisma.message.update({ where: { id: messageId }, data: { state } })
	}
)
