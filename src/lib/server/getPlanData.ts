import { z } from 'fuma/validation'
import { parseQuery } from 'fuma/server'
import type { Event, Prisma } from '@prisma/client'
import { prisma } from '$lib/server'
import { RANGE_DAYS } from '$lib/plan/constants'
import dayjs from '$lib/dayjs'

export type PlanData = Awaited<ReturnType<typeof getPlanData>>

export async function getPlanData({ url, event }: { url: URL; event: Event }) {
	const query = parseQuery(url, {
		teams: z.jsonArray(z.string()).optional(),
		cursor: z.coerce.date().optional(),
	})

	const cursor = dayjs(query.cursor || (await getDefaultCursor(event))).tz(event.timezone)
	const range = {
		start: cursor.add(-RANGE_DAYS, 'day').startOf('day').toDate(),
		end: cursor.add(RANGE_DAYS, 'day').endOf('day').toDate(),
	}
	const where: Prisma.TeamWhereInput = { eventId: event.id }
	if (query.teams) where.id = { in: query.teams }

	const wherePeriods: Prisma.PeriodWhereInput = {
		end: { gte: range.start },
		start: { lte: range.end },
	}

	return {
		cursor: cursor.toDate(),
		range,
		axis: url.searchParams.get('axis') === 'y' ? ('y' as const) : ('x' as const),
		hourSize: +(url.searchParams.get('hourSize') || 20),
		views: await prisma.view.findMany({
			where: { eventId: event.id, key: 'plan' },
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
		milestones: await prisma.milestone.findMany({
			where: { eventId: event.id },
			orderBy: { timestamp: 'asc' },
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

async function getDefaultCursor({ startDate, endDate }: Event): Promise<Date> {
	const now = new Date()
	now.setHours(0, 0, 0, 0)
	if (!startDate || !endDate) return now
	const start = dayjs(startDate)
	const end = dayjs(endDate)
	const len = end.diff(start, 'ms')
	if (len < 2 * RANGE_DAYS * 1000 * 60 * 60 * 24) return start.add(len / 2, 'ms').toDate()
	if (now < startDate) return start.add(RANGE_DAYS, 'day').startOf('day').toDate()
	if (endDate < now) return end.add(-RANGE_DAYS, 'day').startOf('day').toDate()
	return now
}
