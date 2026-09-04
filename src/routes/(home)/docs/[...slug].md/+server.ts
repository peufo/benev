import { error } from '@sveltejs/kit'
import { getDocMarkdown } from '$lib/doc/engine/registry.server'

/**
 * La même page, en markdown. Les agents et les modèles de langage lisent cette surface plutôt que
 * le HTML; `/llms.txt` en donne l'index.
 */
export function GET({ params }) {
	const markdown = getDocMarkdown(params.slug)
	if (!markdown) error(404, "Cette page de documentation n'existe pas")

	return new Response(markdown, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
	})
}
