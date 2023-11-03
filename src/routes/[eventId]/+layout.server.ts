import { prisma } from '$lib/server'
import { error } from '@sveltejs/kit'
import { getMemberProfile } from '$lib/server'

export const load = async ({ depends, parent, params: { eventId } }) => {
	depends('event')
	const { user } = await parent()
	const userId = user?.id || ''

	try {
		return {
			userId: user?.id || '',
			member: await getMemberProfile({ userId, eventId }).catch(() => undefined),
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
