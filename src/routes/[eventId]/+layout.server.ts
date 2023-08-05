import { isOwner, prisma } from '$lib/server'

export const load = async ({ params, locals }) => {
	return {
		isOwner: await isOwner(params.eventId, locals),
		event: await prisma.event.findUniqueOrThrow({ where: { id: params.eventId } }),
	}
}
