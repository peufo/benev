export function roundMinute(ms: number, nbMinutes = 15) {
	const round = 60_000 * nbMinutes
	return Math.round(ms / round) * round
}
