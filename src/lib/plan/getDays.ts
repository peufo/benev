import dayjs, { type Dayjs } from '$lib/dayjs'
import type { Range } from 'fuma'

type Day = { hours: number[]; date: Dayjs }

export function getDays(range: Range, timeZone: string): Day[] {
	const days = []

	function getHours(date: Dayjs): number[] {
		const rangeStart = dayjs(range.start).tz(timeZone)
		const rangeEnd = dayjs(range.end).tz(timeZone)

		if (!date.isSame(rangeStart, 'day') && !date.isSame(rangeEnd, 'day'))
			return Array(24)
				.fill(0)
				.map((_, h) => h)

		const start = date.isSame(rangeStart, 'day') ? rangeStart : date.startOf('day')
		const end = date.isSame(rangeEnd, 'day') ? rangeEnd : date.endOf('day')
		const startHour = start.get('hour')
		const nbHours = end.diff(start, 'hours') + 1
		if (nbHours < 0) return []
		return Array(nbHours)
			.fill(0)
			.map((_, h) => startHour + h)
	}

	for (let day = dayjs(range.start).tz(timeZone); day.isBefore(dayjs(range.end).tz(timeZone)); day = day.add(1, 'day'))
		days.push({ date: day, hours: getHours(day) })

	return days
}
