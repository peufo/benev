import { formAction } from 'fuma/server'
import { prisma, permission } from '$lib/server'

import { modelEventState } from '$lib/models'

export const load = async ({ params: { eventId } }) => {
	return {
		eventCounts: {
			membersValided: await prisma.member.count({
				where: { eventId, isValidedByEvent: true },
			}),
		},
	}
}

export const actions = {
	set_state_event: formAction(modelEventState, async ({ locals, params: { eventId }, data }) => {
		await permission.ownerOrRoot(eventId, locals)
		await prisma.event.update({ where: { id: eventId }, data })
		return
	}),
}
