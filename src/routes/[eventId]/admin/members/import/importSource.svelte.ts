import { getContext, setContext } from 'svelte'
import type { ColumnTarget, CsvTable } from '#lib/member/import/index.js'

const KEY = 'import_source'

/**
 * Le fichier CSV choisi ne quitte pas le navigateur: il passe du choix de la source à la page
 * de mappage par le layout de l'import, qui survit à cette navigation. Un rechargement le perd.
 * Sa lecture et le mappage choisi y restent aussi, pour survivre à un aller-retour entre étapes.
 */
class ImportSource {
	csv: File | null = $state(null)
	table: CsvTable | null = $state(null)
	mapping: ColumnTarget[] = $state([])

	setCsv(file: File) {
		this.csv = file
		this.table = null
		this.mapping = []
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
