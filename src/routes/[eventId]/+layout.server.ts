import { isOwner, isLeaderInEvent, prisma } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async ({ params, locals, depends }) => {
	depends('event')
	const session = await locals.auth.validate()
	const { eventId } = params

	try {
		return {
			userId: session?.user.id || '',
			member: session
				? await prisma.member.findUnique({
						where: { userId_eventId: { userId: session.user.id, eventId } },
				  })
				: null,
			isOwner: !!(await isOwner(eventId, locals)),
			isLeaderInEvent: !!(await isLeaderInEvent(eventId, locals)),
			event: await prisma.event.findUniqueOrThrow({
				where: { id: eventId },
				include: {
					memberFields: {
						where: { memberCanRead: true },
						orderBy: { position: 'asc' },
					},
				},
			}),
			pages: await prisma.page.findMany({
				where: { eventId },
				select: { id: true, title: true, path: true, isIndex: true },
			}),
		}
	} catch {
		throw error(404, 'not found')
	}
}
