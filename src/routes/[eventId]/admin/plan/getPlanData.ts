import { z } from 'fuma/validation'
import { parseQuery } from 'fuma/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '$lib/server'
import dayjs from 'dayjs'

// TODO: Computed from hourSize
const RANGE_DAYS = 4

export async function getPlanData({ url, eventId }: { url: URL; eventId: string }) {
	const query = parseQuery(url, {
		teams: z.jsonArray(z.string()).optional(),
		cursor: z.coerce.date().optional(),
	})

	const cursor = query.cursor || (await getDefaultCursor(eventId))
	const range = {
		start: dayjs(cursor).add(-RANGE_DAYS, 'day').startOf('day').toDate(),
		end: dayjs(cursor).add(RANGE_DAYS, 'day').endOf('day').toDate(),
	}
	const where: Prisma.TeamWhereInput = { eventId }
	if (query.teams) where.id = { in: query.teams }

	const wherePeriods: Prisma.PeriodWhereInput = {
		end: { gte: range.start },
		start: { lte: range.end },
	}

	return {
		cursor,
		range,
		views: await prisma.view.findMany({
			where: { eventId, key: 'plan' },
		}),
		teams_periods: await prisma.team.findMany({
			where,
			orderBy: { position: 'asc' },
			include: {
				periods: {
					where: wherePeriods,
					orderBy: { start: 'asc' },
					include: {
						tags: true,
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
				},
			},
		}),
	}
}

// TODO: use this instead of startDate and endDate ?
// async function getRangeOfEvent(whereTeam: Prisma.TeamWhereInput): Promise<RangeAsDate> {
// 	const { _min, _max } = await prisma.period.aggregate({
// 		where: { team: whereTeam },
// 		_min: { start: true },
// 		_max: { end: true },
// 	})

// 	return { start: _min.start, end: _max.end }
// }

async function getDefaultCursor(eventId: string): Promise<Date> {
	const { startDate, endDate } = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		select: { startDate: true, endDate: true },
	})
	const now = new Date()
	if (!startDate || !endDate) return now
	if (now < startDate) return startDate
	if (endDate < now) return endDate
	now.setHours(12, 0, 0, 0)
	return now
}
