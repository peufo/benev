import { prisma } from '$lib/server'

export const load = async ({ params: { eventId, memberId } }) => {
	return {
		member: await prisma.member.findUniqueOrThrow({
			where: { id: memberId, leaderOf: { some: { eventId } } },
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
	}
}
