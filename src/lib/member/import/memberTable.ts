import type { Member } from '@prisma/client'
import { CONTACT_TARGETS, type ContactKey, type ImportField } from './mapping.js'
import type { CsvTable } from './parseCsv.js'
import type { FieldSuggestion } from './values.js'

/**
 * Une table d'import, et pour chaque colonne le champ à créer si elle n'en trouve pas. Un fichier
 * ne dit rien de ses colonnes; un évènement connaît le champ dont chacune vient.
 */
export type ImportTable = CsvTable & { hints?: (FieldSuggestion | undefined)[] }

export type SourceMember = Pick<
	Member,
	'firstName' | 'lastName' | 'email' | 'phone' | 'birthday' | 'street' | 'zipCode' | 'city'
> & { profileJson: PrismaJson.MemberProfile }

type MemberContact = Exclude<ContactKey, 'fullName'>

/** `fullName` n'a pas lieu d'être: un membre porte son prénom et son nom séparément. */
const CONTACTS = (Object.keys(CONTACT_TARGETS) as ContactKey[]).filter(
	(key): key is MemberContact => key !== 'fullName'
)

/**
 * Les membres d'un autre évènement, écrits comme un CSV les écrirait: tout ce qui suit, mappage,
 * corrections et import, n'a ainsi qu'une seule forme de source à connaître. Les en-têtes des
 * coordonnées sont les libellés que `guessTarget` reconnaît; ceux des champs, leur nom, qui retrouve
 * un champ homonyme de la cible.
 */
export function memberTable(members: SourceMember[], fields: ImportField[]): ImportTable {
	const columns = [
		...CONTACTS.map((key) => ({
			header: CONTACT_TARGETS[key],
			hint: undefined,
			read: (member: SourceMember) => contactValue(member, key),
		})),
		...fields.map((field) => ({
			header: field.name,
			hint: { name: field.name, type: field.type, options: field.options ?? undefined },
			read: (member: SourceMember) => profileValue(member.profileJson[field.id]),
		})),
	]
		.map((column) => ({ ...column, values: members.map(column.read) }))
		// Une colonne que personne n'a remplie n'aurait qu'à être ignorée à la main.
		.filter(({ values }) => values.some(Boolean))

	return {
		headers: columns.map(({ header }) => header),
		rows: members.map((_, index) => columns.map(({ values }) => values[index])),
		hints: columns.map(({ hint }) => hint),
	}
}

function contactValue(member: SourceMember, key: MemberContact): string {
	if (key === 'birthday') return member.birthday?.toISOString().slice(0, 10) ?? ''
	return member[key] ?? ''
}

function profileValue(value: PrismaJson.MemberProfile[string]): string {
	if (value === undefined || value === null) return ''
	if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
	if (!Array.isArray(value)) return String(value)
	// Une option qui contient elle-même un séparateur ne se relit qu'en JSON (`parseList`).
	if (value.some((item) => /[,;]/.test(item))) return JSON.stringify(value)
	return value.join(', ')
}
