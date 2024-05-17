import { tryOrFail, parseFormData, formAction } from 'fuma/server'
import { prisma, getMemberProfile, permission, ensureLicenceMembers } from '$lib/server'
import { z } from 'fuma/validation'

export const load = async ({ parent, params: { memberId, eventId } }) => {
	const { member } = await parent()

	return {
		memberProfile: await getMemberProfile({ id: memberId, eventId }, member),
		event: await prisma.event.findUniqueOrThrow({
			where: { id: eventId, deletedAt: null },
			include: {
				memberFields: {
					orderBy: { position: 'asc' },
				},
				teams: {
					where: { periods: { some: { subscribes: { some: { memberId } } } } },
					include: {
						periods: {
							where: { subscribes: { some: { memberId } } },
							include: { subscribes: { where: { memberId } } },
							orderBy: { start: 'asc' },
						},
					},
				},
			},
		}),
	}
}

export const actions = {
	set_isAdmin: formAction(
		{ isAdmin: z.boolean() },
		async ({ locals, params: { eventId, memberId }, data }) => {
			await permission.owner(eventId, locals)
			return prisma.member.update({ where: { id: memberId }, data })
		}
	),
	set_leader_of: formAction(
		{ leaderOf: z.relations.set },
		async ({ locals, params: { eventId, memberId }, data }) => {
			await permission.admin(eventId, locals)
			return prisma.member.update({ where: { id: memberId }, data })
		}
	),
	set_isValidedByEvent: formAction(
		{ isValidedByEvent: z.boolean() },
		async ({ locals, params: { eventId, memberId }, data }) => {
			await permission.leader(eventId, locals)
			await prisma.member.update({ where: { id: memberId }, data })
			await ensureLicenceMembers(eventId)
		}
	),
}
