import { prisma } from '$lib/server'
import { error } from '@sveltejs/kit'
import { getMemberProfile } from '$lib/server'
import { parseQuery } from 'fuma/server'
import { z } from 'fuma/validation'

export const load = async ({ depends, parent, params: { eventId }, url }) => {
	depends('event')
	const { user } = await parent()
	const userId = user?.id || ''
	const { team_form } = parseQuery(url, { team_form: z.string().optional() })

	const member = await getMemberProfile({ userId, eventId }).catch(() => undefined)
	const isLeader = member?.roles.includes('leader')

	if (team_form) {
		const isLeaderOfTeam =
			member?.roles.includes('admin') || member?.leaderOf.find((t) => t.id === team_form)
		if (!isLeaderOfTeam) error(403, `You are not leader of team "${team_form}"`)
	}

	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId, deletedAt: null },
		include: {
			memberFields: {
				where: isLeader ? {} : { memberCanRead: true },
				orderBy: { position: 'asc' },
			},
		},
	})

	return {
		userId: user?.id || '',
		event,
		member,
		memberCanRegister:
			!member?.isValidedByUser && (event.selfRegisterAllowed || member?.isValidedByEvent),
		pages: await prisma.page.findMany({
			where: { eventId, type: { not: 'email' } },
			select: { id: true, title: true, path: true, type: true },
		}),
		team: !team_form
			? undefined
			: await prisma.team.findUniqueOrThrow({
					where: { id: team_form },
					include: {
						leaders: {
							include: {
								user: true,
							},
						},
					},
			  }),
	}
}
