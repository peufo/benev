const formater = new Intl.DateTimeFormat('fr-ch', {
	weekday: 'long',
	day: 'numeric',
	month: 'numeric',
	year: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
})

type Range = { start: Date; end: Date }

export const formatRange = ({ start, end }: Range) => {
	return formater.formatRange(start, end)
}
