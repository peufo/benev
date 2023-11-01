import { isOwner, isLeaderInEvent, prisma, getMemberWithRole } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async ({ params, locals, depends }) => {
	depends('event')
	const session = await locals.auth.validate()
	const { eventId } = params

	try {
		return {
			userId: session?.user.id || '',
			member: await getMemberWithRole(eventId, locals),
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
