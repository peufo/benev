import { prisma } from '$lib/server'

export const load = async ({ params: { eventId } }) => {
	return {
		teams: await prisma.team.findMany({
			where: { eventId },
			include: {
				periods: true,
			},
		}),
	}
}
