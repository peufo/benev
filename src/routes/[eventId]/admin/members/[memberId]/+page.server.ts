import { tryOrFail, parseFormData } from 'fuma/server'
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
	set_isAdmin: async ({ request, locals, params: { eventId, memberId } }) => {
		await permission.owner(eventId, locals)

		return tryOrFail(async () => {
			const { data } = await parseFormData(request, { isAdmin: z.boolean() })

			return prisma.member.update({
				where: { id: memberId },
				data: { ...data },
			})
		})
	},
	set_leader_of: async ({ request, locals, params: { eventId, memberId } }) => {
		await permission.admin(eventId, locals)

		return tryOrFail(async () => {
			const { data } = await parseFormData(request, { leaderOf: z.relations.set })

			return prisma.member.update({
				where: { id: memberId },
				data: { ...data },
			})
		})
	},
	set_isValidedByEvent: async ({ request, locals, params: { eventId, memberId } }) => {
		await permission.leader(eventId, locals)

		return tryOrFail(async () => {
			const { data } = await parseFormData(request, { isValidedByEvent: z.boolean() })
			await prisma.member.update({
				where: { id: memberId },
				data: { ...data },
			})
			await ensureLicenceMembers(eventId)
		})
	},
}
