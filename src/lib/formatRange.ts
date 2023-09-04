const formater = new Intl.DateTimeFormat('fr-ch', {
	weekday: 'long',
	day: 'numeric',
	month: 'numeric',
	year: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
	timeZone: 'Europe/Zurich',
})

type Range = { start: Date; end: Date }

export const formatRange = ({ start, end }: Range) => formater.formatRange(start, end)

const formaterHour = new Intl.DateTimeFormat('fr-ch', {
	hour: 'numeric',
	minute: 'numeric',
})
export const formatRangeHour = ({ start, end }: Range) => formaterHour.formatRange(start, end)
