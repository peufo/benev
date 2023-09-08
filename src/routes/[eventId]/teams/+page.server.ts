import { prisma } from '$lib/server'

export const load = async ({ params }) => {
	return {
		teams: await prisma.team.findMany({
			where: { eventId: params.eventId },
			include: {
				leaders: {
					include: {
						user: {
							select: {
								firstName: true,
								lastName: true,
							},
						},
					},
				},
				periods: { include: { subscribes: true } },
			},
			orderBy: {
				name: 'asc',
			},
		}),
	}
}
