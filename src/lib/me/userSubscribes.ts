import { prisma } from '$lib/server'

export async function getSubscribesData(userId: string) {
	return {
		events: await prisma.event.findMany({
			where: {
				teams: {
					some: {
						periods: {
							some: {
								subscribes: {
									some: {
										userId,
									},
								},
							},
						},
					},
				},
			},
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
