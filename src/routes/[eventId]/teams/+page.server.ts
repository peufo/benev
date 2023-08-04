import { isOwner, prisma } from '$lib/server'

export const load = async ({ params, locals }) => {
	return {
		isOwner: await isOwner(params.eventId, locals),
		teams: await prisma.team.findMany({
			where: { eventId: params.eventId },
			include: { leaders: true },
		}),
	}
}
