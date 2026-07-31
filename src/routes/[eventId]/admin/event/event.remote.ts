import { form, getRequestEvent } from '$app/server'
import { permission, prisma } from '$lib/server'
import { modelEventState } from '$lib/models'

export const setEventState = form(modelEventState, async (data) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.ownerOrRoot(eventId, locals)
	await prisma.event.update({ where: { id: eventId }, data })
})
