import type { Field } from '@prisma/client'
import { normalize } from './mapping.js'
import { isBoolean, isNumber, parseList } from './validateCell.js'

export type DistinctValue = { value: string; count: number }

/** Les valeurs d'une colonne, les plus fréquentes d'abord. Une liste compte chacun de ses éléments. */
export function distinctValues(
	rows: string[][],
	column: number,
	multiple = false
): DistinctValue[] {
	const counts = new Map<string, number>()
	for (const row of rows) {
		const cell = row[column]
		if (!cell) continue
		for (const value of multiple ? parseList(cell) : [cell]) {
			counts.set(value, (counts.get(value) ?? 0) + 1)
		}
	}
	return [...counts]
		.map(([value, count]) => ({ value, count }))
		.sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
}

/**
 * L'option que désigne vraisemblablement `value`: identique sans casse ni accent, sinon une
 * abréviation (`M` pour `Medium`) ou l'inverse. Un doute vaut un refus: deux candidates, aucune.
 */
export function matchOption(value: string, options: string[]): string | null {
	const needle = normalize(value)
	if (!needle) return null
	const rules = [
		(option: string) => option === needle,
		(option: string) => option.startsWith(needle),
		(option: string) => needle.startsWith(option),
	]
	for (const rule of rules) {
		const found = options.filter((option) => rule(normalize(option)))
		if (found.length === 1) return found[0]
		if (found.length > 1) return null
	}
	return null
}

/** Remplace en place les valeurs d'une colonne. Une liste est réécrite séparée par des virgules. */
export function replaceValues(
	rows: string[][],
	column: number,
	map: Record<string, string>,
	multiple = false
) {
	for (const row of rows) {
		const cell = row[column]
		if (!cell) continue
		if (!multiple) {
			row[column] = map[cell] ?? cell
			continue
		}
		const items = parseList(cell).map((item) => map[item] ?? item)
		row[column] = [...new Set(items)].join(', ')
	}
}

export type FieldSuggestion = Pick<Field, 'name' | 'type'> & { options?: string }

const SELECT_MAX_OPTIONS = 12

/** Le champ à créer pour accueillir une colonne, deviné d'après ses valeurs. */
export function suggestField(header: string, rows: string[][], column: number): FieldSuggestion {
	const values = rows.map((row) => row[column]).filter(Boolean)
	const name = header
	if (!values.length) return { name, type: 'string' }
	if (values.every(isNumber)) return { name, type: 'number' }
	if (values.every(isBoolean)) return { name, type: 'boolean' }
	if (values.some((value) => value.length > 100 || value.includes('\n'))) {
		return { name, type: 'textarea' }
	}
	const distinct = distinctValues(rows, column)
	if (distinct.length <= SELECT_MAX_OPTIONS && distinct.length < values.length) {
		const options = distinct.map(({ value }) => value).sort((a, b) => a.localeCompare(b))
		return { name, type: 'select', options: JSON.stringify(options) }
	}
	return { name, type: 'string' }
}
