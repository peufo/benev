import { getDocSummaries } from '#lib/doc/engine/registry.server.js'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '#lib/seo/index.js'
import { FEATURE_GROUPS } from '#lib/landing/features.js'

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

	// Le jumeau markdown d'une page n'a pas d'ancres: le renvoi vise la page entière.
	const features = FEATURE_GROUPS.map(
		({ title, features }) =>
			`### ${title}\n\n` +
			features
				.map(
					({ name, description, doc }) =>
						`- [${name}](${url.origin}${doc.split('#')[0]}.md): ${description}`
				)
				.join('\n')
	)

	return text(
		[
			`# ${SITE_NAME} — ${SITE_TAGLINE}`,
			`> ${SITE_DESCRIPTION}`,
			`La documentation complète en un fichier: ${url.origin}/llms-full.txt`,
			`## Fonctionnalités\n\n${features.join('\n\n')}`,
			`## Documentation\n\n${lines.join('\n')}`,
		].join('\n\n') + '\n'
	)
}

function text(body: string) {
	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
