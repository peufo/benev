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
