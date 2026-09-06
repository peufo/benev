import type { ResolvedPathname } from '$app/types'
import type { TocSection } from '$lib/ui'

export type DocPage = {
	slug: string
	path: ResolvedPathname
	/** Libellé de navigation, plus court que le titre quand la page en déclare un. */
	label: string
}

export type Doc = DocPage & {
	/** Le titre de la page, son `<h1>` et celui de ses métadonnées. */
	title: string
	description: string
	sections: TocSection[]
	source: string
}
