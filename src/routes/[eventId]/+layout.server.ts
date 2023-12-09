import { prisma } from '$lib/server'
import { error } from '@sveltejs/kit'
import { getMemberProfile } from '$lib/server'

export const load = async ({ depends, parent, params: { eventId } }) => {
	depends('event')
	const { user } = await parent()
	const userId = user?.id || ''

	const member = await getMemberProfile({ userId, eventId }).catch(() => undefined)
	const isLeader = member?.roles.includes('leader')
	console.log({ isLeader })

	try {
		return {
			userId: user?.id || '',
			member,
			event: await prisma.event.findUniqueOrThrow({
				where: { id: eventId },
				include: {
					memberFields: {
						where: { memberCanRead: isLeader },
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
