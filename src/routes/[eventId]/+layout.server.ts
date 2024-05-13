import { error } from '@sveltejs/kit'
import { parseQuery } from 'fuma/server'
import { z } from 'fuma'
import { getTeam, prisma } from '$lib/server'
import { getMemberProfile } from '$lib/server'

export const load = async ({ depends, parent, url, params: { eventId } }) => {
	depends('event')
	const { user } = await parent()
	const userId = user?.id || ''
	try {
		const { form_team } = parseQuery(url, { form_team: z.string().optional() })

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
			team:
				form_team && form_team?.length > 5
					? await getTeam(form_team).catch(() => undefined)
					: undefined,
		}
	} catch {
		error(404, 'not found')
	}
}
