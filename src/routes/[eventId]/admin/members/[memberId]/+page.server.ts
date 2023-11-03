import { prisma, getMemberRole } from '$lib/server'

export const load = async ({ params }) => {
	const { memberId, eventId } = params

	return {
		memberProfile: await prisma.member
			.findUniqueOrThrow({
				where: { id: memberId },
				include: {
					user: true,
					event: { select: { ownerId: true } },
					profile: {
						orderBy: { field: { position: 'asc' } },
					},
					leaderOf: {
						include: {
							leaders: { include: { user: true } },
							periods: { include: { subscribes: true } },
						},
					},
				},
			})
			.then((member) => ({ ...member, role: getMemberRole(member) })),
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
	toggle_is_admin: async ({ locals }) => {
		// TODO
	},
}
