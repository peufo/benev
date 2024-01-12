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

const formaterShort = new Intl.DateTimeFormat('fr-ch', {
	weekday: 'short',
	hour: 'numeric',
	minute: 'numeric',
	timeZone: 'Europe/Zurich',
})

type Range = { start: Date | number; end: Date | number }

export const formatRange = ({ start, end }: Range) => formater.formatRange(start, end)

export const formatRangeShort = ({ start, end }: Range) => formaterShort.formatRange(start, end)

export const formatRangeHour = ({ start, end }: Range) => {
	const _start = dayjs(start)
	const _end = dayjs(end)
	if (_start.isSame(_end)) return _start.format('HH:mm')
	return [_start.format('HH:mm'), _end.format('HH:mm')].join(' – ')
}
