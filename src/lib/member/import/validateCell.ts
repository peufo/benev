import { parseOptions } from 'fuma'
import z from 'zod'
import { jsonParse } from '#lib/jsonParse.js'
import type { ImportField, Target } from './mapping.js'

const NUMBER = /^-?\d+([.,]\d+)?$/
const TRUTHY = ['oui', 'yes', 'true', 'vrai', '1', 'x']
const FALSY = ['non', 'no', 'false', 'faux', '0']

/** Le validateur du serveur: une adresse qu'il refuse ferait échouer tout son lot. */
const zEmail = z.email()
export const isEmail = (value: string) => zEmail.safeParse(value).success
/** Un numéro tel qu'on l'écrit: indicatif, espaces, points ou tirets, au moins neuf chiffres. */
export const isPhone = (value: string) =>
	/^\+?[\d\s./()-]+$/.test(value) && value.replace(/\D/g, '').length >= 9

/** La virgule décimale d'un tableur francophone est acceptée. */
export const isNumber = (value: string) => NUMBER.test(value)

/** `undefined` si la cellule n'est ni un « oui » ni un « non ». */
export function parseBoolean(value: string): boolean | undefined {
	const word = value.toLowerCase()
	if (TRUTHY.includes(word)) return true
	if (FALSY.includes(word)) return false
}
export const isBoolean = (value: string) => parseBoolean(value) !== undefined

/** Chaque cellule y passe: les options d'un champ ne s'indexent qu'une fois. */
const optionIndexes = new WeakMap<ImportField, Map<string, string>>()

/** La valeur enregistrée de l'option, que la cellule cite sa valeur ou son libellé. */
export function findOption(value: string, field: ImportField): string | undefined {
	let index = optionIndexes.get(field)
	if (!index) {
		index = new Map()
		for (const option of parseOptions(field.options ?? []).toReversed()) {
			index.set(option.label.toLowerCase(), option.value)
			index.set(option.value.toLowerCase(), option.value)
		}
		optionIndexes.set(field, index)
	}
	return index.get(value.toLowerCase())
}

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
		const list = jsonParse<unknown>(value, null)
		if (Array.isArray(list)) return list.map(String)
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
		if (target.key === 'email' && !isEmail(value)) return 'Adresse e-mail invalide'
		if (target.key === 'birthday' && !parseBirthday(value)) return 'Date illisible'
		return null
	}

	const { field } = target
	const isOption = (item: string) => findOption(item, field) !== undefined

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
