import type { ResolvedPathname } from '$app/types'
import type { TocSection } from '$lib/ui'

/** L'identité d'une page: de quoi la nommer et l'atteindre, et rien de plus. */
export type DocPage = {
	slug: string
	path: ResolvedPathname
	/** Le titre de la page, son `<h1>` et celui de ses métadonnées. */
	title: string
}

/** Ce qu'il faut pour annoncer une page sans la servir: l'index et `llms.txt`. */
export type DocSummary = DocPage & {
	description: string
	/** Le temps de lecture estimé, en minutes. */
	readingTime: number
}

export type Doc = DocSummary & {
	sections: TocSection[]
	source: string
}
