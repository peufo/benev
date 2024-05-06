import { error } from '@sveltejs/kit'
import { z } from 'fuma/validation'
import { parseQuery } from 'fuma/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '$lib/server'

export const load = async ({ url, params: { eventId } }) => {
	const query = parseQuery(url, {
		teams: z.array(z.string()).optional(),
	})

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
