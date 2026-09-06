import { getDocSummaries } from '$lib/doc/engine/registry.server'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '$lib/seo'

/**
 * Index au format llms.txt: un modèle de langage y trouve la carte de la documentation et le lien
 * markdown de chaque page. Posé à la racine, comme `robots.txt` et `sitemap.xml`, parce que c'est
 * là que les agents le cherchent.
 */
export function GET({ url }) {
	// Le temps de lecture n'y entre pas: il s'adresse à quelqu'un qui lit, pas à ce qui indexe.
	const lines = getDocSummaries().map(
		({ path, title, description }) =>
			`- [${title}](${url.origin}${path}.md)${description ? `: ${description}` : ''}`
	)

	return text(
		[
			`# ${SITE_NAME} — ${SITE_TAGLINE}`,
			`> ${SITE_DESCRIPTION}`,
			`La documentation complète en un fichier: ${url.origin}/llms-full.txt`,
			`## Documentation\n\n${lines.join('\n')}`,
		].join('\n\n') + '\n'
	)
}

function text(body: string) {
	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
