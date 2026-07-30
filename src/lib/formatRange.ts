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

function getFormaterDate(timeZone?: string) {
	return new Intl.DateTimeFormat('fr-ch', {
		dateStyle: 'full',
		...(timeZone ? { timeZone } : {}),
	})
}

/** Compact, pour les listes: «sam. 29 mars 2026». */
function getFormaterDateShort(timeZone?: string) {
	return new Intl.DateTimeFormat('fr-ch', {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		...(timeZone ? { timeZone } : {}),
	})
}

/** Sans année, pour un jour déjà situé par son contexte: «samedi 19 septembre». */
function getFormaterDay(timeZone?: string) {
	return new Intl.DateTimeFormat('fr-ch', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		...(timeZone ? { timeZone } : {}),
	})
}

type Range = { start: Date | number; end: Date | number }

export const formatRange = ({ start, end }: Range, timeZone?: string) =>
	getFormater(timeZone ?? getEventTimeZone()).formatRange(start, end)
export const formatRangeDate = ({ start, end }: Range, timeZone?: string) =>
	getFormaterDate(timeZone ?? getEventTimeZone()).formatRange(start, end)
export const formatDatetime = (date: number | Date, timeZone?: string) =>
	getFormater(timeZone ?? getEventTimeZone()).format(date)

/**
 * Plage de dates compacte, sans heure. `formatRange` d'`Intl` factorise ce qui est
 * commun aux deux bornes; sur une date unique il répèterait tout, d'où le cas à part.
 */
export const formatRangeDateShort = (
	{ start, end }: { start: Date | number; end?: Date | number | null },
	timeZone?: string
) => {
	const formater = getFormaterDateShort(timeZone ?? getEventTimeZone())
	if (end === undefined || end === null || +start === +end) return formater.format(start)
	return formater.formatRange(start, end)
}

/** Un jour seul, en toutes lettres et sans année. */
export const formatDay = (date: number | Date, timeZone?: string) =>
	getFormaterDay(timeZone ?? getEventTimeZone()).format(date)

export const formatRangeHour = ({ start, end }: Range, timeZone?: string) => {
	const tz = timeZone ?? getEventTimeZone()
	const _start = dayjs(start).tz(tz)
	const _end = dayjs(end).tz(tz)
	if (_start.isSame(_end)) return _start.format('HH:mm')
	return [_start.format('HH:mm'), _end.format('HH:mm')].join(' – ')
}
