import { getContext, setContext } from 'svelte'

const KEY = 'import_source'

/**
 * Le fichier CSV choisi ne quitte pas le navigateur: il passe du choix de la source à la page
 * de mappage par le layout de l'import, qui survit à cette navigation. Un rechargement le perd.
 */
class ImportSource {
	csv: File | null = $state(null)
}

export const importSource = {
	init() {
		return setContext(KEY, new ImportSource())
	},
	get() {
		return getContext<ImportSource>(KEY)
	},
}
