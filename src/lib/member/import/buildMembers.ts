import {
	isBlocking,
	resolveTarget,
	type ColumnReport,
	type ColumnTarget,
	type ImportField,
} from './mapping.js'
import type { CsvTable } from './parseCsv.js'
import { findOption, parseBirthday, parseBoolean, parseList } from './validateCell.js'

export type ProfileValue = NonNullable<PrismaJson.MemberProfile[string]>

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

/**
 * Tenu par le serveur, par compte et sur une journée: créer un second évènement ne le contourne
 * pas. Le client ne fait que l'annoncer.
 */
export const MAX_IMPORT_INVITES = 500

export type SkippedRow = { line: number; name: string; email: string; reason: string }

export const memberName = ({ firstName, lastName }: Pick<ImportRow, 'firstName' | 'lastName'>) =>
	`${firstName} ${lastName}`.trim()

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

		const name = memberName(row)
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
			return parseBoolean(value)
		case 'select':
			return findOption(value, field)
		case 'multiselect':
			return parseList(value)
				.map((item) => findOption(item, field))
				.filter((item) => item !== undefined)
		default:
			return value
	}
}

/** La raison qui empêche d'importer, ou `null` si rien ne s'y oppose. */
export function importBlocker(reports: ColumnReport[], mapping: ColumnTarget[]): string | null {
	if (reports.some(({ status }) => isBlocking(status))) {
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
