import { prisma } from '$lib/server'

export async function getData(userId: string) {
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
			include: { teams: true },
		}),
		subscribes: await prisma.subscribe.findMany({
			where: { userId },
			include: { period: true },
			orderBy: { period: { start: 'asc' } },
		}),
	}
}
