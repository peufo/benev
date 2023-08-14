import { prisma } from '$lib/server'

export const load = async ({ params }) => {
	const { eventId } = params
	return {
		leader: await prisma.user.findUniqueOrThrow({
			where: { id: params.leaderId, leadersOf: { some: { team: { eventId } } } },
			include: {
				leadersOf: {
					where: { team: { eventId } },
					include: {
						team: {
							include: {
								leaders: { include: { user: true } },
								periods: { include: { subscribes: true } },
							},
						},
					},
				},
			},
		}),
	}
}
