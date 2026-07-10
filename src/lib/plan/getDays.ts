import { type Dayjs } from '$lib/dayjs'

export type Day = { hours: number[]; date: Dayjs }

export function getDays(start: Dayjs, end: Dayjs): Day[] {
	const days = []
	for (let day = start; day.isBefore(end); day = day.add(1, 'day'))
		days.push({ date: day, hours: getHours(day) })
	return days

	function getHours(date: Dayjs): number[] {
		if (!date.isSame(start, 'day') && !date.isSame(end, 'day'))
			return Array(24)
				.fill(0)
				.map((_, h) => h)

		const truncStart = date.isSame(start, 'day') ? start : date.startOf('day')
		const truncEnd = date.isSame(end, 'day') ? end : date.endOf('day')
		const startHour = truncStart.get('hour')
		const nbHours = truncEnd.diff(truncStart, 'hours') + 1
		if (nbHours < 0) return []
		return Array(nbHours)
			.fill(0)
			.map((_, h) => startHour + h)
	}
}
