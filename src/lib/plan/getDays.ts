import dayjs, { type Dayjs } from 'dayjs'
import type { Range } from 'fuma'

type Day = { hours: number[]; date: Dayjs }

export function getDays(range: Range): Day[] {
	const days = []

	function getHours(date: Dayjs): number[] {
		if (!date.isSame(range.start, 'day') && !date.isSame(range.end, 'day'))
			return Array(24)
				.fill(0)
				.map((_, h) => h)

		const start = date.isSame(range.start, 'day') ? dayjs(range.start) : date.startOf('day')
		const end = date.isSame(range.end, 'day') ? dayjs(range.end) : date.endOf('day')
		const startHour = start.get('hour')
		const nbHours = end.diff(start, 'hours') + 1
		if (nbHours < 0) return []
		return Array(nbHours)
			.fill(0)
			.map((_, h) => startHour + h)
	}

	for (let day = dayjs(range.start); day.isBefore(range.end); day = day.add(1, 'day'))
		days.push({ date: day, hours: getHours(day) })

	return days
}
