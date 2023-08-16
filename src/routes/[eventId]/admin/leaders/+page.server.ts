import { prisma } from '$lib/server'

export const load = async ({ params: { eventId } }) => ({
	members: await prisma.member.findMany({
		where: {
			eventId,
			leaderOf: { some: { eventId } },
		},
		include: {
			user: true,
			leaderOf: true,
		},
	}),
})
