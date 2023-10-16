import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { parseQuery, prisma } from '$lib/server'
import { jsonParse } from '$lib/jsonParse.js'

export const load = async ({ url, params: { eventId } }) => {
	const query = parseQuery(
		url,
		z.object({
			teams: z.string().optional(),
		})
	)
	const where: Prisma.TeamWhereInput = { eventId }

	if (query.teams) {
		const teams = jsonParse<string[]>(query.teams, [])
		where.id = { in: teams }
	}

	return {
		teams_periods: await prisma.team.findMany({
			where,
			include: {
				periods: {
					include: { subscribes: true },
					orderBy: { start: 'asc' },
				},
			},
			orderBy: { name: 'asc' },
		}),
	}
}
