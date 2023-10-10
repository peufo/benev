import { prisma } from '$lib/server'

export const load = async ({ params }) => {
	const { memberId, eventId } = params

	return {
		memberProfile: await prisma.member.findUniqueOrThrow({
			where: { id: memberId },
			include: {
				user: true,
				profile: true,
				leaderOf: {
					include: {
						leaders: { include: { user: true } },
						periods: { include: { subscribes: true } },
					},
				},
			},
		}),
		event: await prisma.event.findUniqueOrThrow({
			where: { id: eventId },
			include: {
				memberFields: true,
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