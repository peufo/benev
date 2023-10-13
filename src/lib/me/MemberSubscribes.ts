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
										member: {
											userId,
										},
									},
								},
							},
						},
					},
				},
			},
			include: {
				teams: {
					where: { periods: { some: { subscribes: { some: { member: { userId } } } } } },
					include: {
						periods: {
							where: { subscribes: { some: { member: { userId } } } },
							include: { subscribes: { where: { member: { userId } } } },
							orderBy: { start: 'asc' },
						},
					},
				},
			},
		}),
	}
}
