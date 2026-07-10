import { daytz } from '$lib/dayjs'
import type { PlanData } from '$lib/server'
import { getDays } from './getDays'
import type { Plan } from './types'

export function getPlan(data: PlanData): Plan {
	const start = daytz(data.range.start).startOf('day')
	const end = daytz(data.range.end).endOf('day')
	const days = getDays(start, end)
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
