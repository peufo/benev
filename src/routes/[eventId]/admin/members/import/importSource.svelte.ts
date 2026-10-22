import { getContext, setContext } from 'svelte'
import { SvelteSet } from 'svelte/reactivity'
import {
	guessMapping,
	type ColumnTarget,
	type ImportField,
	type ImportTable,
} from '#lib/member/import/index.js'
import type { ImportResult } from '#lib/member/memberImport.remote.js'

export type ImportReport = { source: string; results: ImportResult[] }

const KEY = 'import_source'

/**
 * La source en cours de mappage, qu'elle vienne d'un fichier ou d'un autre évènement. Le fichier
 * CSV ne quitte pas le navigateur: il passe du choix de la source à la page de mappage par le
 * layout de l'import, qui survit à cette navigation. Un rechargement le perd.
 *
 * La table, le mappage et les lignes décochées y restent aussi, pour qu'un aller-retour entre
 * étapes garde les corrections faites.
 */
class ImportSource {
	csv: File | null = $state(null)
	/** Ce qui identifie la source de `table`: `csv`, ou `event:<id>`. */
	key: string | null = $state(null)
	table: ImportTable | null = $state(null)
	mapping: ColumnTarget[] = $state([])
	/** Les index des lignes que l'admin a décochées. */
	excluded = $state.raw(new SvelteSet<number>())
	/** Le rapport du dernier import. Lui non plus ne survit pas à un rechargement. */
	report: ImportReport | null = $state(null)

	setCsv(file: File) {
		this.reset()
		this.csv = file
	}

	/** Une source déjà chargée garde son mappage et ses corrections. */
	load(key: string, table: ImportTable, fields: ImportField[]) {
		if (this.key === key && this.table) return
		this.key = key
		this.table = table
		this.mapping = guessMapping(table.headers, fields)
		this.excluded = new SvelteSet()
	}

	reset() {
		this.csv = null
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
