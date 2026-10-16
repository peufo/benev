import { parseOptions } from 'fuma'
import type { Target } from './mapping.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NUMBER = /^-?\d+([.,]\d+)?$/
const BOOLEANS = ['oui', 'non', 'yes', 'no', 'true', 'false', 'vrai', 'faux', '1', '0', 'x']

/** La virgule décimale d'un tableur francophone est acceptée. */
export const isNumber = (value: string) => NUMBER.test(value)
export const isBoolean = (value: string) => BOOLEANS.includes(value.toLowerCase())

/** `jj.mm.aaaa`, `jj/mm/aaaa`, `jj-mm-aaaa` ou `aaaa-mm-jj`, à condition que la date existe. */
export function parseBirthday(value: string): Date | null {
	const swiss = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/)
	const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
	const parts = swiss ? [swiss[3], swiss[2], swiss[1]] : iso ? [iso[1], iso[2], iso[3]] : null
	if (!parts) return null
	const [year, month, day] = parts.map(Number)
	const date = new Date(Date.UTC(year, month - 1, day))
	if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
	return date
}

/** Notre export écrit un tableau JSON; un tableur, plutôt une liste séparée par `,` ou `;`. */
export function parseList(value: string): string[] {
	if (value.startsWith('[')) {
		try {
			const list: unknown = JSON.parse(value)
			if (Array.isArray(list)) return list.map(String)
		} catch {
			// Pas du JSON: on retombe sur la liste séparée.
		}
	}
	return value
		.split(/[,;]/)
		.map((item) => item.trim())
		.filter(Boolean)
}

/** Le motif du refus, ou `null` si la cellule convient. Une cellule vide convient toujours. */
export function validateCell(value: string, target: Target): string | null {
	if (!value) return null

	if (target.kind === 'contact') {
		if (target.key === 'email' && !EMAIL.test(value)) return 'Adresse e-mail invalide'
		if (target.key === 'birthday' && !parseBirthday(value)) return 'Date illisible'
		return null
	}

	const { field } = target
	const options = parseOptions(field.options ?? [])
	const isOption = (item: string) =>
		options.some((option) =>
			[option.value, option.label].some((text) => text.toLowerCase() === item.toLowerCase())
		)

	switch (field.type) {
		case 'number':
			return isNumber(value) ? null : "N'est pas un nombre"
		case 'boolean':
			return isBoolean(value) ? null : 'Ni « oui » ni « non »'
		case 'select':
			return isOption(value) ? null : "N'est pas une option du champ"
		case 'multiselect': {
			const unknown = parseList(value).filter((item) => !isOption(item))
			return unknown.length ? `Options inconnues: ${unknown.join(', ')}` : null
		}
		default:
			return null
	}
}
