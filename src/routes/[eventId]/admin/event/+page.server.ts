import { tryOrFail, parseFormData } from 'fuma/server'
import { prisma, permission, media, ensureLicenceEvent, ensureLicenceMembers } from '$lib/server'

import { modelEventState, modelEventUpdate } from '$lib/models'

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
	update_event: async ({ request, locals, params: { eventId } }) => {
		const member = await permission.admin(eventId, locals)

		return tryOrFail(async () => {
			const { data, formData } = await parseFormData(request, modelEventUpdate)
			await media.upload(formData, {
				key: 'poster',
				where: { posterOf: { id: eventId } },
				data: {
					name: `Affiche`,
					createdById: member.user.id,
					posterOf: { connect: { id: eventId } },
				},
			})
			await media.upload(formData, {
				key: 'logo',
				where: { logoOf: { id: eventId } },
				data: {
					name: `Logo`,
					createdById: member.user.id,
					logoOf: { connect: { id: eventId } },
				},
			})

			return prisma.event.update({
				where: { id: eventId },
				data,
			})
		})
	},
	delete_event: async ({ locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)

		return tryOrFail(
			() =>
				prisma.event.delete({
					where: { id: eventId },
				}),
			'/'
		)
	},
}
