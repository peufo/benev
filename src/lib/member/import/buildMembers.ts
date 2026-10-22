import { parseOptions } from 'fuma'
import { resolveTarget, type ColumnReport, type ColumnTarget, type ImportField } from './mapping.js'
import type { CsvTable } from './parseCsv.js'
import { isBoolean, parseBirthday, parseList } from './validateCell.js'

export type ProfileValue = string | number | boolean | string[]

/** Une ligne prête à écrire: les valeurs ont déjà le type de leur champ. */
export type ImportRow = {
	/** Le numéro de la ligne dans le fichier, en-tête comprise: celui de la colonne `#`. */
	line: number
	firstName: string
	lastName: string
	email?: string
	phone?: string
	/** `aaaa-mm-jj` */
	birthday?: string
	street?: string
	zipCode?: string
	city?: string
	profile: Record<string, ProfileValue>
}

export type SkippedRow = { line: number; name: string; email: string; reason: string }

/** La file d'e-mails est en mémoire et sérialisée: un import ne doit pas la saturer. */
export const MAX_IMPORT_INVITES = 50

const TRUE = ['oui', 'yes', 'true', 'vrai', '1', 'x']

export type BuildOptions = {
	/** Le numéro de la première ligne: 2 sous l'en-tête d'un fichier, 1 sans fichier derrière. */
	firstLine?: number
	/** Les lignes décochées: ni importées ni écartées, absentes du rapport. */
	excluded?: ReadonlySet<number>
}

/**
 * Les lignes de la source, converties selon le mappage. Une colonne ignorée, sans champ ou en
 * erreur n'écrit rien: `importBlocker` refuse déjà un mappage qui en contient d'erronées.
 */
export function buildMembers(
	table: CsvTable,
	mapping: ColumnTarget[],
	fields: ImportField[],
	{ firstLine = 2, excluded = new Set() }: BuildOptions = {}
): { rows: ImportRow[]; skipped: SkippedRow[] } {
	const targets = mapping.map((target) =>
		target && target !== 'ignore' ? resolveTarget(target, fields) : null
	)
	const rows: ImportRow[] = []
	const skipped: SkippedRow[] = []
	const emails = new Set<string>()

	table.rows.forEach((cells, index) => {
		if (excluded.has(index)) return
		const row: ImportRow = { line: index + firstLine, firstName: '', lastName: '', profile: {} }

		targets.forEach((target, column) => {
			const value = cells[column]
			if (!target || !value) return
			if (target.kind === 'field') {
				const converted = convert(value, target.field)
				if (converted !== undefined) row.profile[target.field.id] = converted
				return
			}
			switch (target.key) {
				case 'fullName': {
					const [firstName, ...lastName] = value.split(/\s+/)
					row.firstName = firstName
					row.lastName = lastName.join(' ')
					return
				}
				case 'email':
					row.email = value.toLowerCase()
					return
				case 'birthday':
					row.birthday = parseBirthday(value)?.toISOString().slice(0, 10)
					return
				default:
					row[target.key] = value
			}
		})

		const name = `${row.firstName} ${row.lastName}`.trim()
		const email = row.email ?? ''
		if (!name) return skipped.push({ line: row.line, name, email, reason: 'Nom manquant' })
		if (row.email && emails.has(row.email)) {
			return skipped.push({
				line: row.line,
				name,
				email,
				reason: 'Adresse en double dans le fichier',
			})
		}
		if (row.email) emails.add(row.email)
		rows.push(row)
	})

	return { rows, skipped }
}

function convert(value: string, field: ImportField): ProfileValue | undefined {
	switch (field.type) {
		case 'number':
			return Number(value.replace(',', '.'))
		case 'boolean':
			return isBoolean(value) ? TRUE.includes(value.toLowerCase()) : undefined
		case 'select':
			return canonicalOption(value, field)
		case 'multiselect':
			return parseList(value)
				.map((item) => canonicalOption(item, field))
				.filter((item) => item !== undefined)
		default:
			return value
	}
}

/** La valeur enregistrée de l'option, que la cellule cite sa valeur ou son libellé. */
function canonicalOption(value: string, field: ImportField): string | undefined {
	const needle = value.toLowerCase()
	return parseOptions(field.options ?? []).find((option) =>
		[option.value, option.label].some((text) => text.toLowerCase() === needle)
	)?.value
}

/** La raison qui empêche d'importer, ou `null` si rien ne s'y oppose. */
export function importBlocker(reports: ColumnReport[], mapping: ColumnTarget[]): string | null {
	if (reports.some(({ status }) => status === 'duplicate' || status === 'invalid')) {
		return "Corrige d'abord les colonnes en rouge"
	}
	const hasName = mapping.some(
		(target) =>
			target === 'contact:fullName' ||
			target === 'contact:firstName' ||
			target === 'contact:lastName'
	)
	if (!hasName) return 'Indique quelle colonne porte le nom des membres'
	return null
}
