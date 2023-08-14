import { prisma } from '$lib/server'

export const load = async ({ params }) => {
	const { userId } = params

	return {
		userProfile: await prisma.user.findUniqueOrThrow({ where: { id: userId } }),
		event: await prisma.event.findUniqueOrThrow({
			where: { id: params.eventId },
			include: {
				teams: {
					where: { periods: { some: { subscribes: { some: { userId } } } } },
					include: {
						periods: {
							where: { subscribes: { some: { userId } } },
							include: { subscribes: true },
							orderBy: { start: 'asc' },
						},
					},
				},
			},
		}),
	}
}
