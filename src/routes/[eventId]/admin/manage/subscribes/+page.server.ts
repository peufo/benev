import { parseQuery, prisma } from '$lib/server'
import { Prisma } from '@prisma/client'
import { error } from '@sveltejs/kit'
import { z } from 'zod'

export const load = async ({ url, params: { eventId } }) => {
	const query = parseQuery(
		url,
		z.object({
			search: z.string(),
			start: z.coerce.date(),
			end: z.coerce.date(),
			teams: z.string(),
			fieldId: z.string(),
			fieldValue: z.string(),
		})
	)

	const where: Prisma.SubscribeWhereInput = {}
	const team: Prisma.TeamWhereInput = { eventId }
	const period: Prisma.PeriodWhereInput = { team }

	if (query.teams) {
		try {
			const teams = JSON.parse(query.teams) as string[]
			team.id = { in: teams }
		} catch {
			throw error(400, '"teams is not a valid JSON of type string[]')
		}
	}

	if (query.start && query.end) {
		period.start = { lte: query.end }
		period.end = { gte: query.start }
	}

	where.period = period

	if (query.search) {
		where.member = {
			user: {
				OR: [
					{ firstName: { contains: query.search } },
					{ lastName: { contains: query.search } },
					{ email: { contains: query.search } },
				],
			},
		}
	}

	return {
		subscribes: await prisma.subscribe.findMany({
			where,
			include: {
				member: {
					include: { user: true },
				},
				period: {
					include: { team: true },
				},
			},
			orderBy: { period: { start: 'asc' } },
		}),
	}
}
