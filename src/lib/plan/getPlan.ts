import { daytz } from '#lib/dayjs.js'
import { getEventTimeZone } from '#lib/timezone.js'
import { startOfDay, startOfNextDay } from '#lib/wallClock.js'
import type { PlanData } from '#lib/server/index.js'
import { getDays } from './getDays'
import type { Plan } from './types'

export function getPlan(data: PlanData): Plan {
	const timezone = getEventTimeZone()
	const start = daytz(startOfDay(+data.range.start, timezone))
	const end = daytz(startOfNextDay(+data.range.end, timezone) - 1)
	const days = getDays(start, end, timezone)
	const milestones = data.milestones.map((m) => ({ ...m, time: daytz(m.timestamp) }))
	return {
		axis: data.axis,
		cursor: daytz(data.cursor),
		start,
		end,
		hourSize: data.hourSize,
		days,
		length: days.reduce((acc, { hours }) => acc + hours.length, 0) * data.hourSize,
		milestones,
		milestonesInRange: milestones.filter(({ time }) => time.isAfter(start) && time.isBefore(end)),
	}
}
