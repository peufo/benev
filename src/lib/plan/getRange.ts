import type { Period } from '@prisma/client'
import dayjs from 'dayjs'

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
		start: dayjs(periods[0]).toDate(),
		end: dayjs(periods.at(-1)).toDate(),
	}
}
