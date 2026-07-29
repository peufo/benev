import { form, getRequestEvent } from '$app/server'
import z from 'zod'
import { modelGiftCreate } from '$lib/models'
import { permission, prisma } from '$lib/server'

export const createGift = form(z.object(modelGiftCreate), async (data) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)

	return prisma.gift.create({
		data: { ...data, eventId },
		include: { conditions: true },
	})
})
