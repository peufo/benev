import { form, getRequestEvent } from '$app/server'
import z from 'zod'
import { permission, prisma } from '$lib/server'
import { modelEventState } from '$lib/models'

export const setEventState = form(z.object(modelEventState), async (data) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.ownerOrRoot(eventId, locals)
	await prisma.event.update({ where: { id: eventId }, data })
})
