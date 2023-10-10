import dayjs from 'dayjs'

const formater = new Intl.DateTimeFormat('fr-ch', {
	weekday: 'long',
	day: 'numeric',
	month: 'numeric',
	year: '2-digit',
	hour: 'numeric',
	minute: 'numeric',
	timeZone: 'Europe/Zurich',
})

type Range = { start: Date; end: Date }

export const formatRange = ({ start, end }: Range) => formater.formatRange(start, end)

export const formatRangeHour = ({ start, end }: Range) =>
	[dayjs(start).format('HH:mm'), dayjs(end).format('HH:mm')].join(' – ')
