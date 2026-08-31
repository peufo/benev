import { describe, it } from 'vitest'
import { getStacks } from '$lib/plan/getStacks'

type TestPeriod = { id: string; start: Date; end: Date; tags: { name: string }[] }

const at = (hour: number) => new Date(2026, 7, 31, hour)

const period = (id: string, start: number, end: number, ...tags: string[]): TestPeriod => ({
	id,
	start: at(start),
	end: at(end),
	tags: tags.map((name) => ({ name })),
})

const ids = (stacks: TestPeriod[][]) => stacks.map((stack) => stack.map(({ id }) => id))

describe('getStacks', () => {
	it('returns a single empty stack for no period', ({ expect }) => {
		expect(getStacks([])).toEqual([[]])
	})

	it('stacks untagged periods on overlap only', ({ expect }) => {
		const periods = [period('a', 8, 10), period('b', 9, 11), period('c', 12, 13)]
		expect(ids(getStacks(periods))).toEqual([['a', 'c'], ['b']])
	})

	// Des périodes qui se touchent ne se chevauchent pas: sans regroupement, `b2` remonterait dans
	// la ligne de `a` et couperait l'étiquette B en deux.
	it('keeps every period of a tag on the same stack', ({ expect }) => {
		const periods = [
			period('a1', 8, 10, 'A'),
			period('b1', 9, 11, 'B'),
			period('n', 12, 13),
			period('a2', 14, 16, 'A'),
			period('b2', 16, 18, 'B'),
		]
		expect(ids(getStacks(periods))).toEqual([
			['a1', 'a2', 'n'],
			['b1', 'b2'],
		])
	})

	it('gives a self-overlapping tag a contiguous block of stacks', ({ expect }) => {
		const periods = [period('a1', 8, 12, 'A'), period('a2', 10, 14, 'A'), period('b', 8, 9, 'B')]
		const stacks = ids(getStacks(periods))
		expect(stacks[0]).toContain('a1')
		expect(stacks[1]).toContain('a2')
		expect(stacks.flat()).toHaveLength(3)
	})

	// Le glisser-déposer remplace la période à sa place dans le tableau: l'ordre du serveur est
	// perdu dès le premier déplacement.
	it('does not depend on the received order', ({ expect }) => {
		const sorted = [
			period('a1', 8, 10, 'A'),
			period('b1', 9, 11, 'B'),
			period('a2', 14, 16, 'A'),
			period('b2', 16, 18, 'B'),
		]
		const shuffled = [sorted[3], sorted[0], sorted[2], sorted[1]]
		expect(ids(getStacks(shuffled))).toEqual(ids(getStacks(sorted)))
	})

	// Une période portant plusieurs étiquettes suit la première, celle affichée en tête de carte.
	it('groups a multi-tagged period on its first tag', ({ expect }) => {
		const periods = [
			period('a1', 8, 10, 'A'),
			period('b1', 9, 11, 'B'),
			period('a2', 12, 14, 'A', 'B'),
			period('b2', 15, 16, 'B'),
		]
		expect(ids(getStacks(periods))).toEqual([
			['a1', 'a2'],
			['b1', 'b2'],
		])
	})
})
