import { z } from 'fuma/validation'
import { parseQuery } from 'fuma/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '$lib/server'

export const load = async ({ url, params: { eventId } }) => {
	const data = parseQuery(url, {
		teams: z.array(z.string()).optional(),
	})

	const where: Prisma.TeamWhereInput = { eventId }

	if (data.teams) where.id = { in: data.teams }

	return {
		teams_periods: await prisma.team.findMany({
			where,
			include: {
				periods: {
					include: { subscribes: { include: { member: { include: { user: true } } } } },
					orderBy: { start: 'asc' },
				},
			},
			orderBy: { position: 'asc' },
		}),
	}
}
