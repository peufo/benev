import dayjs from 'dayjs'

export const getAge = (date: Date | null) => {
	const day = dayjs()
	if (!date) return '-'
	return day.diff(dayjs(date), 'year') + ' ans'
}
