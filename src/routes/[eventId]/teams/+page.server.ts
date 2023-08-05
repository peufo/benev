import { prisma } from '$lib/server'

export const load = async ({ params, locals }) => {
	return {
		teams: await prisma.team.findMany({
			where: { eventId: params.eventId },
			include: { leaders: true },
		}),
	}
}
