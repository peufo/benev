import { getContext, setContext } from 'svelte'
import { SvelteSet } from 'svelte/reactivity'
import {
	decodeCsv,
	guessMapping,
	type ColumnTarget,
	type ImportField,
	type ImportTable,
} from '#lib/member/import/index.js'
import type { ImportResult } from '#lib/member/memberImport.remote.js'

export type ImportReport = { source: string; results: ImportResult[] }

/** Un texte tabulaire à lire: le contenu d'un fichier, ou ce qui a été collé. */
export type TextSource = {
	/** `csv` ou `paste`: la clé de la table, et ce que les messages disent de la source. */
	kind: 'csv' | 'paste'
	name: string
	read: () => Promise<string>
	header: boolean
}

const KEY = 'import_source'

/**
 * La source en cours de mappage: un fichier, un collage ou un autre évènement. Le texte ne quitte
 * pas le navigateur: il passe du choix de la source à la page de mappage par le layout de
 * l'import, qui survit à cette navigation. Un rechargement le perd.
 *
 * La table, le mappage et les lignes décochées y restent aussi, pour qu'un aller-retour entre
 * étapes garde les corrections faites.
 */
class ImportSource {
	text: TextSource | null = $state(null)
	/** Ce qui identifie la source de `table`: `csv`, `paste`, ou `event:<id>`. */
	key: string | null = $state(null)
	table: ImportTable | null = $state(null)
	mapping: ColumnTarget[] = $state([])
	/** Les index des lignes que l'admin a décochées. */
	excluded = $state.raw(new SvelteSet<number>())
	/** Le rapport du dernier import. Lui non plus ne survit pas à un rechargement. */
	report: ImportReport | null = $state(null)

	setCsv(file: File) {
		this.reset()
		this.text = {
			kind: 'csv',
			name: file.name,
			read: async () => decodeCsv(await file.arrayBuffer()),
			header: true,
		}
	}

	setPasted(text: string, header: boolean) {
		this.reset()
		this.text = { kind: 'paste', name: 'Données collées', read: async () => text, header }
	}

	/** Une source déjà chargée garde son mappage et ses corrections. */
	load(key: string, table: ImportTable, fields: ImportField[]) {
		if (this.key === key && this.table) return
		this.key = key
		this.table = table
		this.mapping = guessMapping(table.headers, fields, table.rows)
		this.excluded = new SvelteSet()
	}

	reset() {
		this.text = null
		this.key = null
		this.table = null
		this.mapping = []
		this.excluded = new SvelteSet()
	}
}

export const importSource = {
	init() {
		return setContext(KEY, new ImportSource())
	},
	get() {
		return getContext<ImportSource>(KEY)
	},
}
