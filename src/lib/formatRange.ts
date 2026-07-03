import dayjs from '$lib/dayjs'
import { getEventTimeZone } from './timezone'

function getFormater(timeZone?: string) {
	return new Intl.DateTimeFormat('fr-ch', {
		weekday: 'long',
		day: 'numeric',
		month: 'numeric',
		year: '2-digit',
		hour: 'numeric',
		minute: 'numeric',
		...(timeZone ? { timeZone } : {}),
	})
}

function getFormaterShort(timeZone?: string) {
	return new Intl.DateTimeFormat('fr-ch', {
		weekday: 'short',
		hour: 'numeric',
		minute: 'numeric',
		...(timeZone ? { timeZone } : {}),
	})
}

function getFormaterDate(timeZone?: string) {
	return new Intl.DateTimeFormat('fr-ch', {
		dateStyle: 'full',
		...(timeZone ? { timeZone } : {}),
	})
}

type Range = { start: Date | number; end: Date | number }

export const formatRange = ({ start, end }: Range, timeZone?: string) =>
	getFormater(timeZone ?? getEventTimeZone()).formatRange(start, end)
export const formatRangeShort = ({ start, end }: Range, timeZone?: string) =>
	getFormaterShort(timeZone ?? getEventTimeZone()).formatRange(start, end)
export const formatRangeDate = ({ start, end }: Range, timeZone?: string) =>
	getFormaterDate(timeZone ?? getEventTimeZone()).formatRange(start, end)
export const formatDatetime = (date: number | Date, timeZone?: string) =>
	getFormater(timeZone ?? getEventTimeZone()).format(date)
export const formatDatetimeShort = (date: number | Date, timeZone?: string) =>
	getFormaterShort(timeZone ?? getEventTimeZone()).format(date)

export const formatRangeHour = ({ start, end }: Range, timeZone?: string) => {
	const tz = timeZone ?? getEventTimeZone()
	const _start = dayjs(start).tz(tz)
	const _end = dayjs(end).tz(tz)
	if (_start.isSame(_end)) return _start.format('HH:mm')
	return [_start.format('HH:mm'), _end.format('HH:mm')].join(' – ')
}
