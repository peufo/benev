import { error } from '@sveltejs/kit'
import { z } from '$lib/validation'
import type { Prisma } from '@prisma/client'
import { parseQuery, prisma } from '$lib/server'

export const load = async ({ url, params: { eventId } }) => {
	const { data, err } = parseQuery(url, {
		teams: z.array(z.string()).optional(),
	})
	if (err) throw error(400)
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
			orderBy: { name: 'asc' },
		}),
	}
}
