import { prisma } from '$lib/server'

export const load = async ({ params }) => {
	const teams = await prisma.team.findMany({
		where: { eventId: params.eventId },
		include: { leaders: true },
	})

	return { teams }
}
