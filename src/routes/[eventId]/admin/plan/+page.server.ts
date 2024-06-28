import { z } from 'fuma/validation'
import type { RangeAsDate } from 'fuma'
import { parseQuery } from 'fuma/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '$lib/server'

export const load = async ({ url, params: { eventId } }) => {
	const query = parseQuery(url, {
		teams: z.array(z.string()).optional(),
		range: z.json({ start: z.coerce.date(), end: z.coerce.date() }).optional(),
	})

	const where: Prisma.TeamWhereInput = { eventId }
	if (query.teams) where.id = { in: query.teams }

	const wherePeriods: Prisma.PeriodWhereInput = {}
	if (query.range) {
		wherePeriods.end = { gte: query.range.start }
		wherePeriods.start = { lte: query.range.end }
	}
	return {
		rangeOfEvent: await getRangeOfEvent(eventId),
		teams_periods: await prisma.team.findMany({
			where,
			include: {
				periods: {
					where: wherePeriods,
					include: {
						subscribes: {
							where: {
								state: { in: ['request', 'accepted'] },
							},
							include: {
								member: {
									include: {
										user: {
											select: {
												firstName: true,
												lastName: true,
											},
										},
									},
								},
							},
						},
					},
					orderBy: { start: 'asc' },
				},
			},
			orderBy: { position: 'asc' },
		}),
	}
}

async function getRangeOfEvent(eventId: string): Promise<RangeAsDate> {
	const { _min, _max } = await prisma.period.aggregate({
		where: { team: { eventId } },
		_min: { start: true },
		_max: { end: true },
	})

	return { start: _min.start, end: _max.end }
}
