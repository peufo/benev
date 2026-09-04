import { error } from '@sveltejs/kit'
import { getDoc, getDocNeighbours } from '$lib/doc/engine/registry.server'
import { pageMetaTags } from '$lib/seo'

export const load = ({ params }) => {
	const doc = getDoc(params.slug)
	if (!doc) error(404, "Cette page de documentation n'existe pas")

	// `source` reste au serveur: la page rend le composant compilé, pas le markdown.
	const { source: _source, ...rest } = doc
	return {
		doc: rest,
		...getDocNeighbours(params.slug),
		metaTags: pageMetaTags({ title: doc.title, description: doc.description }),
	}
}
