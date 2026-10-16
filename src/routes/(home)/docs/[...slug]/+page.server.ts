import { error } from '@sveltejs/kit'
import { getDoc, getDocNeighbours } from '#lib/doc/engine/registry.server.js'
import { pageMetaTags } from '#lib/seo/index.js'

export const load = ({ params }) => {
	const doc = getDoc(params.slug)
	if (!doc) error(404, "Cette page de documentation n'existe pas")

	// `source` reste au serveur: la page rend le composant compilé, pas le markdown.
	const { source: _source, ...rest } = doc
	return {
		doc: rest,
		...getDocNeighbours(params.slug),
		// Le frontmatter donne un fragment taillé pour une carte: seul, il ne dit ni de quoi ni de qui.
		metaTags: pageMetaTags({
			title: doc.title,
			description: `${doc.title}, la documentation de benevio : ${doc.description.charAt(0).toLowerCase()}${doc.description.slice(1)}.`,
		}),
	}
}
