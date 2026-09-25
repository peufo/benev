import type { Plan } from './types'

type Range = { start: number; end: number }

/**
 * Borne un créneau à la plage que le plan affiche. Le serveur charge tout créneau qui croise la
 * plage: sans cette borne, celui qui la déborde agrandirait la zone de défilement, et le bord qui
 * charge la plage suivante ne serait plus atteint au bon endroit.
 */
export function clipToPlan(
	{ start, end }: Range,
	plan: Pick<Plan, 'start' | 'end'>
): Range & { clippedStart: boolean; clippedEnd: boolean } {
	const min = plan.start.valueOf()
	const max = plan.end.valueOf()
	const clamp = (value: number) => Math.min(Math.max(value, min), max)
	return {
		start: clamp(start),
		end: clamp(end),
		clippedStart: start < min,
		clippedEnd: end > max,
	}
}
