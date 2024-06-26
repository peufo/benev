import { isFreeRange } from 'perod'
import type { PeriodWithSubscribesUserName as P } from './types'

export function getStacks(periods: P[]): P[][] {
	if (!periods.length) return [[]]
	const _stacks: P[][] = []

	function getPeriodStackIndex(period: P, curentStackIndex = 0): number {
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
