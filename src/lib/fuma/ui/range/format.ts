import dayjs from 'dayjs'
import type { Range, RangeRequired } from '$lib/fuma/ui/range/types.js'

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
	month: 'long',
	day: '2-digit',
	hour: 'numeric',
	minute: 'numeric',
	timeZone: 'Europe/Zurich',
})

function isRequiredRange(range?: Range): range is RangeRequired {
	if (!range) return false
	return (
		range.start !== null &&
		range.start !== undefined &&
		range.end !== null &&
		range.end !== undefined
	)
}

export const formatRange = (range?: Range, placeholder = '') => {
	dayjs()
	if (!isRequiredRange(range)) return placeholder
	const start = dayjs(range.start).toDate()
	const end = dayjs(range.end).toDate()
	return formater.formatRange(start, end)
}

export const formatRangeShort = (range: Range, placeholder = '') => {
	if (!isRequiredRange(range)) return placeholder
	const start = dayjs(range.start).toDate()
	const end = dayjs(range.end).toDate()
	return formaterShort.formatRange(start, end)
}

export const formatRangeHour = (range: Range, placeholder = '') => {
	if (!isRequiredRange(range)) return placeholder
	const start = dayjs(range.start)
	const end = dayjs(range.end)
	if (start.isSame(end)) return start.format('HH:mm')
	return [start.format('HH:mm'), end.format('HH:mm')].join(' – ')
}
