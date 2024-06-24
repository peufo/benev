import { prisma } from '$lib/server'

export const load = async ({ params: { eventId } }) => {
	return {
		teams: await prisma.team.findMany({
			where: { eventId },
			include: {
				periods: {
					include: {
						subscribes: {
							include: {
								member: {
									include: {
										user: {
											select: {
												firstName: true,
												lastName: true,
											},
										},
									},
								},
							},
						},
					},
				},
			},
		}),
	}
}
