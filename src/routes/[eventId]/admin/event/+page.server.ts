import { tryOrFail, parseFormData } from 'fuma/server'
import { prisma, permission, ensureLicenceEvent, ensureLicenceMembers } from '$lib/server'

import { modelEventState } from '$lib/models'

export const load = async ({ parent, params: { eventId } }) => {
	const { event } = await parent()

	return {
		eventCounts: {
			membersValided: await prisma.member.count({
				where: { eventId, isValidedByEvent: true },
			}),
			membersLicenced: await prisma.member.count({
				where: { eventId, licence: { isNot: null } },
			}),
			memberLicencesAvailable: await prisma.licence.count({
				where: { ownerId: event.ownerId, type: 'member', memberId: null },
			}),
		},
		eventLicenceAvailable: await prisma.licence.findFirst({
			where: { ownerId: event.ownerId, type: 'event', eventId: null },
		}),
	}
}

export const actions = {
	set_state_event: async ({ request, locals, params: { eventId } }) => {
		await permission.owner(eventId, locals)

		return tryOrFail(async () => {
			const { data } = await parseFormData(request, modelEventState)
			if (data.state !== 'draft') await ensureLicenceEvent(eventId)
			await prisma.event.update({ where: { id: eventId }, data })
			await ensureLicenceMembers(eventId)
			return
		})
	},
}
