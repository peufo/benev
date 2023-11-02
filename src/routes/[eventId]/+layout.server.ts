import { prisma } from '$lib/server'
import { error } from '@sveltejs/kit'
import { getMemberRole } from '$lib/server'

export const load = async ({ depends, parent, params: { eventId } }) => {
	depends('event')
	const { user } = await parent()
	const userId = user?.id || ''

	const member = await prisma.member.findUnique({
		where: { userId_eventId: { userId, eventId } },
		include: {
			user: { select: { email: true } },
			event: { select: { ownerId: true } },
			leaderOf: true,
		},
	})

	try {
		return {
			userId: user?.id || '',
			member: member && { ...member, role: getMemberRole(member) },
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
