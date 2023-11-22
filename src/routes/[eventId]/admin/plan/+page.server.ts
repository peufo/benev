import { z } from '$lib/validation'
import type { Prisma } from '@prisma/client'
import { parseQuery, prisma } from '$lib/server'

export const load = async ({ url, params: { eventId } }) => {
	const query = parseQuery(
		url,
		z.object({
			teams: z.array(z.string()).optional(),
		})
	)
	const where: Prisma.TeamWhereInput = { eventId }

	if (query.teams) where.id = { in: query.teams }

	return {
		teams_periods: await prisma.team.findMany({
			where,
			include: {
				periods: {
					include: { subscribes: { include: { member: { include: { user: true } } } } },
					orderBy: { start: 'asc' },
				},
			},
			orderBy: { name: 'asc' },
		}),
	}
}
