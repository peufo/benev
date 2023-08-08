import { isOwner, prisma } from '$lib/server'

export const load = async ({ params, locals, depends }) => {
	depends('event')
	const select = { id: true, title: true, path: true, isIndex: true }
	return {
		isOwner: await isOwner(params.eventId, locals),
		event: await prisma.event.findUniqueOrThrow({ where: { id: params.eventId } }),
		pageIndex: await prisma.page.findFirstOrThrow({
			where: { eventId: params.eventId, isIndex: true },
			select,
		}),
		pages: await prisma.page.findMany({
			where: { eventId: params.eventId, isIndex: false },
			select,
		}),
	}
}
