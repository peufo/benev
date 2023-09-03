import { prisma } from '$lib/server'

export const load = async ({ params: { eventId } }) => ({
	teams: await prisma.team.findMany({
		where: { eventId },
		include: {
			periods: {
				include: { subscribes: true },
			},
		},
	}),
})
