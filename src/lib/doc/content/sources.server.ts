/**
 * Les sources brutes des pages, chargées d'un bloc mais retenues au serveur: le navigateur ne
 * reçoit que la page compilée, par `loadDocComponent`.
 */
const modules = import.meta.glob<string>('./**/*.svx', {
	query: '?raw',
	import: 'default',
	eager: true,
})

/**
 * Indexées par slug: le chemin sous `content/`, sans extension. Cette correspondance appartient
 * au contenu: le moteur ne construit jamais de chemin de fichier.
 */
export const DOC_SOURCES: Record<string, string> = Object.fromEntries(
	Object.entries(modules).map(([path, source]) => [path.slice(2, -'.svx'.length), source])
)
