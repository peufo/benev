import { getDocMarkdown, getDocs } from '$lib/doc/engine/registry.server'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '$lib/seo'

/** Toute la documentation d'un bloc, dans l'ordre de lecture, pour une lecture en une requête. */
export function GET() {
	const pages = getDocs().map(({ slug }) => getDocMarkdown(slug))

	// Le filet ne sépare que des pages: l'en-tête et son résumé forment un seul bloc.
	const header = `# ${SITE_NAME} — ${SITE_TAGLINE}\n\n> ${SITE_DESCRIPTION}`
	const body = [header, ...pages].join('\n\n---\n\n')

	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
