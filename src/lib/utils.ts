import dayjs from 'dayjs'

export const getAge = (date: Date | null) => {
	const day = dayjs()
	if (!date) return '-'
	return day.diff(dayjs(date), 'year') + ' ans'
}

export function getTextColor(bg: string): string {
	const hex = bg.substring(1)
	const r = parseInt(hex.substring(0, 2), 16)
	const g = parseInt(hex.substring(2, 4), 16)
	const b = parseInt(hex.substring(4, 6), 16)

	// Formule de luminosité perçue (YIQ)
	const brightness = (r * 299 + g * 587 + b * 114) / 1000
	return brightness > 128 ? '#000000' : '#ffffff'
}
