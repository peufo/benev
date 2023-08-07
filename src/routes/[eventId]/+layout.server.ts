import { isOwner, prisma } from '$lib/server'

export const load = async ({ params, locals, depends }) => {
	depends('event')
	return {
		isOwner: await isOwner(params.eventId, locals),
		event: await prisma.event.findUniqueOrThrow({ where: { id: params.eventId } }),
		pages: await prisma.page.findMany({
			where: { eventId: params.eventId },
			select: { id: true, title: true, path: true, isIndex: true },
		}),
	}
}
