import { formAction } from 'fuma/server'
import { prisma, permission } from '$lib/server'

import { modelEventState } from '$lib/models'

export const actions = {
	set_state_event: formAction(modelEventState, async ({ locals, params: { eventId }, data }) => {
		await permission.ownerOrRoot(eventId, locals)
		await prisma.event.update({ where: { id: eventId }, data })
		return
	}),
}
