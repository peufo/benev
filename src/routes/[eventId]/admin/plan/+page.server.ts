import { z } from 'fuma/validation'
import type { Range } from 'fuma'
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
		rangeOfEvent: await getRangeOfEvent(eventId),
		teams_periods: await prisma.team.findMany({
			where,
			include: {
				periods: {
					include: {
						subscribes: {
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

async function getRangeOfEvent(eventId: string): Promise<Range> {
	const { _min, _max } = await prisma.period.aggregate({
		where: { team: { eventId } },
		_min: { start: true },
		_max: { end: true },
	})

	return { start: _min.start, end: _max.end }
}
