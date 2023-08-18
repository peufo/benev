import { isOwner, prisma } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async ({ params, locals, depends }) => {
	depends('event')
	const session = await locals.auth.validate()
	const { eventId } = params

	const select = { id: true, title: true, path: true, isIndex: true }

	try {
		return {
			member: session
				? await prisma.member.findUnique({
						where: { userId_eventId: { userId: session.user.id, eventId } },
				  })
				: null,
			isOwner: await isOwner(params.eventId, locals),
			event: await prisma.event.findUniqueOrThrow({ where: { id: eventId } }),
			pageIndex: await prisma.page.findFirstOrThrow({
				where: { eventId, isIndex: true },
				select,
			}),
			pages: await prisma.page.findMany({
				where: { eventId, isIndex: false },
				select,
			}),
		}
	} catch {
		throw error(404, 'not found')
	}
}
