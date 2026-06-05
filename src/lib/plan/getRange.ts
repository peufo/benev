import type { Period } from '@prisma/client'
import { daytz } from '$lib/dayjs'

type RangeOfDate = {
	start: Date
	end: Date
}

export function getRangeOfTeam(team: { periods: Period[] }): RangeOfDate | null {
	if (!team.periods.length) return null
	const periods = team.periods
		.map((p) => [p.start.getTime(), p.end.getTime()])
		.flat(1)
		.toSorted()
	return {
		start: daytz(periods[0]).toDate(),
		end: daytz(periods.at(-1)).toDate(),
	}
}
