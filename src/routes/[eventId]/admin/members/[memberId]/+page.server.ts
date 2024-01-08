import { prisma, getMemberProfile, permission, parseFormData, tryOrFail } from '$lib/server'
import { z } from '$lib/validation'

export const load = async ({ parent, params: { memberId, eventId } }) => {
	const { member } = await parent()

	return {
		memberProfile: await getMemberProfile({ memberId }, member),
		event: await prisma.event.findUniqueOrThrow({
			where: { id: eventId },
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
		const { err, data } = await parseFormData(request, { isAdmin: z.boolean() })
		if (err) return err

		return tryOrFail(() =>
			prisma.member.update({
				where: { id: memberId },
				data: { ...data },
			})
		)
	},
	set_leader_of: async ({ request, locals, params: { eventId, memberId } }) => {
		await permission.admin(eventId, locals)
		const { err, data } = await parseFormData(request, { leaderOf: z.relations.set })
		if (err) return err

		return tryOrFail(() =>
			prisma.member.update({
				where: { id: memberId },
				data: { ...data },
			})
		)
	},
}
