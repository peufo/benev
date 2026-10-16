import { describe, it } from 'vitest'
import {
	guessMapping,
	distinctValues,
	guessTarget,
	matchOption,
	parseBirthday,
	parseCsv,
	replaceValues,
	reportColumns,
	suggestField,
	validateCell,
	type ImportField,
} from '#lib/member/import/index.js'

const field = (data: Partial<ImportField> & Pick<ImportField, 'id' | 'name' | 'type'>) =>
	({ label: null, options: null, ...data }) satisfies ImportField

const size = field({ id: 'size', name: 'Taille', type: 'select', options: '["S","M","L"]' })
const diet = field({
	id: 'diet',
	name: 'Régime',
	label: 'Ton régime alimentaire',
	type: 'multiselect',
	options: '["Végétarien","Sans gluten"]',
})
const age = field({ id: 'age', name: 'Âge', type: 'number' })
const fields = [size, diet, age]

describe('lecture du CSV', () => {
	it('devine le point-virgule et retire le BOM', ({ expect }) => {
		const table = parseCsv('\uFEFFPrénom;Nom\nAda;Lovelace\n')
		expect(table).toEqual({ headers: ['Prénom', 'Nom'], rows: [['Ada', 'Lovelace']] })
	})

	it('nomme les en-têtes vides et complète les lignes courtes', ({ expect }) => {
		const table = parseCsv('a,,c\n1\n\n')
		expect(table.headers).toEqual(['a', 'Colonne 2', 'c'])
		expect(table.rows).toEqual([['1', '', '']])
	})

	it('garde les retours à la ligne entre guillemets', ({ expect }) => {
		expect(parseCsv('note\n"deux\nlignes"').rows).toEqual([['deux\nlignes']])
	})
})

describe('deviner le champ', () => {
	it('reconnaît les coordonnées, accents et casse ignorés', ({ expect }) => {
		expect(guessTarget('PRENOM', fields)).toBe('contact:firstName')
		expect(guessTarget('Courriel', fields)).toBe('contact:email')
		expect(guessTarget('Date de naissance', fields)).toBe('contact:birthday')
		expect(guessTarget('NPA', fields)).toBe('contact:zipCode')
	})

	it("reconnaît un champ de l'évènement par son nom ou son libellé", ({ expect }) => {
		expect(guessTarget('taille', fields)).toBe('field:size')
		expect(guessTarget('Ton régime alimentaire', fields)).toBe('field:diet')
	})

	it("préfère le champ de l'évènement à une coordonnée homonyme", ({ expect }) => {
		const phone = field({ id: 'tel', name: 'Téléphone', type: 'string' })
		expect(guessTarget('Téléphone', [phone])).toBe('field:tel')
	})

	it('mappe les en-têtes de notre propre export', ({ expect }) => {
		expect(guessMapping(['name', 'email', 'phone', 'Taille'], fields)).toEqual([
			'contact:fullName',
			'contact:email',
			'contact:phone',
			'field:size',
		])
	})

	it("ne donne une cible qu'à la première colonne qui y répond", ({ expect }) => {
		expect(guessMapping(['Email', 'Courriel', 'Inconnue'], fields)).toEqual([
			'contact:email',
			null,
			null,
		])
		expect(guessMapping(['Nom complet', 'Prénom'], fields)).toEqual(['contact:fullName', null])
	})
})

describe('valider une cellule', () => {
	const contact = (key: 'email' | 'birthday' | 'phone') => ({ kind: 'contact', key }) as const
	const onField = (field: ImportField) => ({ kind: 'field', field }) as const

	it('accepte toujours une cellule vide', ({ expect }) => {
		expect(validateCell('', onField(size))).toBeNull()
	})

	it("vérifie l'e-mail et la date de naissance", ({ expect }) => {
		expect(validateCell('ada@example.com', contact('email'))).toBeNull()
		expect(validateCell('ada@', contact('email'))).not.toBeNull()
		expect(validateCell('31.12.1990', contact('birthday'))).toBeNull()
		expect(validateCell('1990-12-31', contact('birthday'))).toBeNull()
		expect(validateCell('31.02.1990', contact('birthday'))).not.toBeNull()
		expect(validateCell('n importe quoi', contact('phone'))).toBeNull()
	})

	it('lit les dates suisses comme ISO', ({ expect }) => {
		expect(parseBirthday('3/4/2001')?.toISOString()).toBe('2001-04-03T00:00:00.000Z')
	})

	it('vérifie les nombres, la virgule décimale comprise', ({ expect }) => {
		expect(validateCell('12,5', onField(age))).toBeNull()
		expect(validateCell('douze', onField(age))).not.toBeNull()
	})

	it('vérifie les oui / non', ({ expect }) => {
		const ok = field({ id: 'ok', name: 'Ok', type: 'boolean' })
		expect(validateCell('Oui', onField(ok))).toBeNull()
		expect(validateCell('peut-être', onField(ok))).not.toBeNull()
	})

	it('vérifie les options, sans casse', ({ expect }) => {
		expect(validateCell('m', onField(size))).toBeNull()
		expect(validateCell('XXL', onField(size))).not.toBeNull()
	})

	it('lit une liste séparée ou un tableau JSON', ({ expect }) => {
		expect(validateCell('végétarien; sans gluten', onField(diet))).toBeNull()
		expect(validateCell('["Végétarien"]', onField(diet))).toBeNull()
		expect(validateCell('Végétarien, Vegan', onField(diet))).toBe('Options inconnues: Vegan')
	})
})

describe('état des colonnes', () => {
	const table = parseCsv(
		'Prénom,Courriel,Taille,Inconnue\nAda,ada@example.com,M,x\nAlan,alan,XXL,y'
	)

	it('signale les colonnes sans champ et les valeurs refusées', ({ expect }) => {
		const report = reportColumns(table, guessMapping(table.headers, fields), fields)
		expect(report.map((column) => column.status)).toEqual(['ok', 'invalid', 'invalid', 'unmapped'])
		expect([...report[2].invalid.keys()]).toEqual([1])
	})

	it('signale un champ visé deux fois, prénom et nom complet compris', ({ expect }) => {
		const report = reportColumns(
			table,
			['contact:fullName', 'ignore', 'ignore', 'contact:firstName'],
			fields
		)
		expect(report.map((column) => column.status)).toEqual([
			'duplicate',
			'ignored',
			'ignored',
			'duplicate',
		])
	})
})

describe('correspondance des valeurs', () => {
	const sizes = ['Small', 'Medium', 'Large', 'Extra large']

	it('compte les valeurs distinctes, éléments de liste compris', ({ expect }) => {
		const rows = [['M'], ['L'], ['M'], ['']]
		expect(distinctValues(rows, 0)).toEqual([
			{ value: 'M', count: 2 },
			{ value: 'L', count: 1 },
		])
		expect(distinctValues([['a, b'], ['b']], 0, true)).toEqual([
			{ value: 'b', count: 2 },
			{ value: 'a', count: 1 },
		])
	})

	it('reconnaît une option, son abréviation, ou la valeur qui la prolonge', ({ expect }) => {
		expect(matchOption('medium', sizes)).toBe('Medium')
		expect(matchOption('M', sizes)).toBe('Medium')
		expect(matchOption('Large (XL)', ['Small', 'Large'])).toBe('Large')
	})

	it('refuse de choisir entre deux candidates', ({ expect }) => {
		expect(matchOption('Lar', ['Large', 'Largest'])).toBeNull()
		expect(matchOption('XXL', sizes)).toBeNull()
	})

	it('réécrit une colonne, simple ou liste', ({ expect }) => {
		const rows = [
			['M', 'Végé; GF'],
			['L', 'GF'],
			['', ''],
		]
		replaceValues(rows, 0, { M: 'Medium' })
		replaceValues(rows, 1, { GF: 'Sans gluten', Végé: 'Végétarien' }, true)
		expect(rows).toEqual([
			['Medium', 'Végétarien, Sans gluten'],
			['L', 'Sans gluten'],
			['', ''],
		])
	})
})

describe('suggérer un champ', () => {
	const suggest = (...values: string[]) =>
		suggestField(
			'Colonne',
			values.map((value) => [value]),
			0
		)

	it('devine le type depuis les valeurs', ({ expect }) => {
		expect(suggest('12', '3,5').type).toBe('number')
		expect(suggest('oui', 'Non', '').type).toBe('boolean')
		expect(suggest('a'.repeat(101)).type).toBe('textarea')
		expect(suggest('Ada', 'Alan').type).toBe('string')
	})

	it('propose une liste quand les valeurs se répètent', ({ expect }) => {
		expect(suggest('M', 'L', 'M')).toEqual({
			name: 'Colonne',
			type: 'select',
			options: '["L","M"]',
		})
	})
})
