import type { Period, Team } from '@prisma/client'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

type Range = {
	start: Dayjs
	end: Dayjs
}

type RangeOfDate = {
	start: Date
	end: Date
}

export function getRangeOfTeams(teams: (Team & { periods: Period[] })[]): Range {
	const periods = teams
		.map(({ periods }) => periods.map((p) => [p.start.getTime(), p.end.getTime()]))
		.flat(2)
		.toSorted()
	return {
		start: dayjs(periods[0]).startOf('day'),
		end: dayjs(periods.at(-1)).endOf('day'),
	}
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
