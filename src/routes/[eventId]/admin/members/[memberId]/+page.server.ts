import { prisma } from '$lib/server'

export const load = async ({ params }) => {
	const { memberId, eventId } = params

	return {
		memberProfile: await prisma.member.findUniqueOrThrow({
			where: { id: memberId },
			include: {
				user: true,
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
				teams: {
					where: { periods: { some: { subscribes: { some: { memberId } } } } },
					include: {
						periods: {
							where: { subscribes: { some: { memberId } } },
							include: { subscribes: true },
							orderBy: { start: 'asc' },
						},
					},
				},
			},
		}),
	}
}
