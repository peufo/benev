type TimeUnit = 'hour' | 'minute' | 'second' | 'ms'
const CONVERSION: Record<TimeUnit, Record<TimeUnit, number>> = {
	hour: {
		hour: 1,
		minute: 60,
		second: 3_600,
		ms: 3_600_000,
	},
	minute: {
		hour: 1 / 60,
		minute: 1,
		second: 60,
		ms: 60_000,
	},
	second: {
		hour: 1 / 3_600,
		minute: 1 / 60,
		second: 1,
		ms: 1000,
	},
	ms: {
		hour: 1 / 3_600_000,
		minute: 1 / 3_600,
		second: 1 / 1000,
		ms: 1,
	},
}

export function time(value: number, unit: TimeUnit = 'ms') {
	return {
		to(u: TimeUnit) {
			return value * CONVERSION[unit][u]
		},
		roundBy(roundValue: number, u: TimeUnit = unit) {
			const round = roundValue * CONVERSION[u][unit]
			return Math.round(value / round) * round
		},
	}
}
