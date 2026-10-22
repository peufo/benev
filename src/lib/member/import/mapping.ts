import type { Field } from '@prisma/client'
import { isEmail, isPhone, parseBirthday, validateCell } from './validateCell.js'
import type { CsvTable } from './parseCsv.js'

export type ImportField = Pick<Field, 'id' | 'name' | 'label' | 'type' | 'options'>

/** Les coordonnées d'un membre, plus `fullName` que notre propre export écrit en une colonne. */
export const CONTACT_TARGETS = {
	fullName: 'Prénom et nom',
	firstName: 'Prénom',
	lastName: 'Nom de famille',
	email: 'E-mail',
	phone: 'Téléphone',
	birthday: 'Date de naissance',
	street: 'Rue et numéro',
	zipCode: 'Code postal',
	city: 'Localité',
} as const

export type ContactKey = keyof typeof CONTACT_TARGETS
export type TargetKey = `contact:${ContactKey}` | `field:${string}`
/** `null`: aucun champ trouvé. `ignore`: écarté par l'admin. */
export type ColumnTarget = TargetKey | 'ignore' | null

export type Target = { kind: 'contact'; key: ContactKey } | { kind: 'field'; field: ImportField }

/** Comparés après `normalize`: sans casse, sans accent, sans espace ni ponctuation. */
const CONTACT_SYNONYMS: Record<ContactKey, string[]> = {
	fullName: ['name', 'fullname', 'nomcomplet', 'nometprenom', 'prenometnom', 'nomprenom'],
	firstName: ['prenom', 'firstname', 'givenname', 'first'],
	lastName: ['nom', 'nomdefamille', 'lastname', 'surname', 'familyname', 'last'],
	email: ['email', 'mail', 'courriel', 'adresseemail', 'adressemail', 'emailaddress'],
	phone: ['telephone', 'tel', 'phone', 'mobile', 'natel', 'portable', 'phonenumber'],
	birthday: ['datedenaissance', 'naissance', 'birthday', 'birthdate', 'dateofbirth'],
	street: ['rueetnumero', 'adresse', 'rue', 'street', 'address'],
	zipCode: ['codepostal', 'npa', 'cp', 'zip', 'zipcode', 'postalcode'],
	city: ['localite', 'ville', 'city', 'commune', 'lieu'],
}

export function normalize(text: string): string {
	return text
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '')
}

/** Un champ de l'évènement l'emporte sur une coordonnée: son nom a été choisi pour cet évènement. */
export function guessTarget(header: string, fields: ImportField[]): TargetKey | null {
	const needle = normalize(header)
	if (!needle) return null
	const field = fields.find(
		(field) =>
			normalize(field.name) === needle || (field.label && normalize(field.label) === needle)
	)
	if (field) return `field:${field.id}`
	for (const [key, synonyms] of Object.entries(CONTACT_SYNONYMS)) {
		if (synonyms.includes(needle)) return `contact:${key as ContactKey}`
	}
	return null
}

/**
 * Ce que disent les valeurs quand l'en-tête ne dit rien: une sélection copiée sans sa ligne
 * d'en-tête, ou un titre inconnu. Seules les formes sans ambiguïté sont reconnues, et toutes les
 * valeurs non vides doivent y répondre.
 */
export function guessFromValues(rows: string[][], column: number): TargetKey | null {
	const values = rows.map((row) => row[column]).filter(Boolean)
	if (!values.length) return null
	if (values.every(isEmail)) return 'contact:email'
	if (values.every((value) => parseBirthday(value))) return 'contact:birthday'
	if (values.every(isPhone)) return 'contact:phone'
	return null
}

/** Une cible n'est devinée qu'une fois: la première colonne qui y répond la garde. */
export function guessMapping(
	headers: string[],
	fields: ImportField[],
	rows: string[][] = []
): ColumnTarget[] {
	const taken = new Set<string>()
	return headers.map((header, column) => {
		const target = guessTarget(header, fields) ?? guessFromValues(rows, column)
		if (!target || covers(target).some((key) => taken.has(key))) return null
		for (const key of covers(target)) taken.add(key)
		return target
	})
}

/** `fullName` remplit le prénom et le nom: il entre en conflit avec l'un comme avec l'autre. */
function covers(target: TargetKey): string[] {
	if (target === 'contact:fullName') return ['contact:firstName', 'contact:lastName']
	return [target]
}

export function resolveTarget(target: TargetKey, fields: ImportField[]): Target | null {
	const [kind, key] = target.split(/:(.*)/) as ['contact' | 'field', string]
	if (kind === 'contact') return key in CONTACT_TARGETS ? { kind, key: key as ContactKey } : null
	const field = fields.find((field) => field.id === key)
	return field ? { kind, field } : null
}

/** La cible de chaque colonne, `null` pour une colonne ignorée ou sans champ. */
export function resolveTargets(mapping: ColumnTarget[], fields: ImportField[]): (Target | null)[] {
	return mapping.map((target) =>
		target && target !== 'ignore' ? resolveTarget(target, fields) : null
	)
}

export type ColumnStatus = 'ok' | 'unmapped' | 'ignored' | 'duplicate' | 'invalid'

/** Une colonne en double ou aux valeurs refusées empêche d'importer. */
export const isBlocking = (status: ColumnStatus) => status === 'duplicate' || status === 'invalid'

export type ColumnReport = {
	status: ColumnStatus
	/** Le motif de chaque cellule refusée, indexé par ligne. */
	invalid: Map<number, string>
}

/** Combien de colonnes visent chaque cible: au-delà d'une, elles sont en double. */
export function targetUsage(mapping: ColumnTarget[]): Map<string, number> {
	const usage = new Map<string, number>()
	for (const target of mapping) {
		if (!target || target === 'ignore') continue
		for (const key of covers(target)) usage.set(key, (usage.get(key) ?? 0) + 1)
	}
	return usage
}

/**
 * Le motif de chaque cellule refusée, lignes décochées comprises: cocher ou décocher une ligne ne
 * doit pas revalider la colonne, seulement refiltrer (`columnReport`).
 */
export function columnIssues(
	rows: string[][],
	column: number,
	resolved: Target | null
): Map<number, string> {
	const issues = new Map<number, string>()
	if (!resolved) return issues
	rows.forEach((row, index) => {
		const issue = validateCell(row[column], resolved)
		if (issue) issues.set(index, issue)
	})
	return issues
}

/** Une ligne exclue de l'import n'a rien à valider: sa valeur fautive ne doit rien bloquer. */
export function columnReport(
	target: ColumnTarget,
	resolved: Target | null,
	issues: Map<number, string>,
	usage: Map<string, number>,
	excluded: ReadonlySet<number> = new Set()
): ColumnReport {
	if (target === 'ignore') return { status: 'ignored', invalid: new Map() }
	if (!target || !resolved) return { status: 'unmapped', invalid: new Map() }
	const invalid = new Map([...issues].filter(([index]) => !excluded.has(index)))
	if (covers(target).some((key) => (usage.get(key) ?? 0) > 1)) {
		return { status: 'duplicate', invalid }
	}
	return { status: invalid.size ? 'invalid' : 'ok', invalid }
}

export function reportColumns(
	table: CsvTable,
	mapping: ColumnTarget[],
	fields: ImportField[],
	excluded: ReadonlySet<number> = new Set()
): ColumnReport[] {
	const usage = targetUsage(mapping)
	const targets = resolveTargets(mapping, fields)
	return table.headers.map((_, column) => {
		const resolved = targets[column] ?? null
		const issues = columnIssues(table.rows, column, resolved)
		return columnReport(mapping[column] ?? null, resolved, issues, usage, excluded)
	})
}
