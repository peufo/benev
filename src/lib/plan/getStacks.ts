import { isFreeRange } from 'perod'

export function getStacks<T extends {start: Date, end: Date}>(periods: T[]): T[][] {
	if (!periods.length) return [[]]
	const _stacks: T[][] = []

	function getPeriodStackIndex(period: T, curentStackIndex = 0): number {
		const stack = _stacks[curentStackIndex] || []
		if (isFreeRange(period, stack)) return curentStackIndex
		return getPeriodStackIndex(period, curentStackIndex + 1)
	}

	periods.forEach((period) => {
		const stackIndex = getPeriodStackIndex(period)
		if (!_stacks[stackIndex]) _stacks[stackIndex] = []
		_stacks[stackIndex].push(period)
	})

	return _stacks
}
