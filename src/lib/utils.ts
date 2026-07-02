import dayjs from '$lib/dayjs'

export const getAge = (date: Date | null) => {
	if (!date) return '-'
	return dayjs().diff(dayjs(date), 'year') + ' ans'
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

export function msToHours(ms: number): string {
	const hours = ms / (1000 * 60 * 60)
	return (
		Math.floor(hours).toString().padStart(2, '0') +
		':' +
		Math.floor((hours % 1) * 60)
			.toString()
			.padStart(2, '0')
	)
}
