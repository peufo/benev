import { prisma } from '$lib/server'
import { error } from '@sveltejs/kit'
import { getMemberProfile } from '$lib/server'

export const load = async ({ depends, parent, params: { eventId } }) => {
	depends('event')
	const { user } = await parent()
	const userId = user?.id || ''
	try {
		const member = await getMemberProfile({ userId, eventId }).catch(() => undefined)
		const isLeader = member?.roles.includes('leader')

		const event = await prisma.event.findUniqueOrThrow({
			where: { id: eventId, deletedAt: null },
			include: {
				memberFields: {
					where: isLeader ? {} : { memberCanRead: true },
					orderBy: { position: 'asc' },
				},
			},
		})

		const memberCanRegister =
			!member?.isValidedByUser && (event.selfRegisterAllowed || member?.isValidedByEvent)

		return {
			userId: user?.id || '',
			event,
			member,
			memberCanRegister,
			pages: await prisma.page.findMany({
				where: { eventId, type: { not: 'email' } },
				select: { id: true, title: true, path: true, type: true },
			}),
		}
	} catch {
		error(404, 'not found')
	}
}
