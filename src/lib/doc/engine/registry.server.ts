import { resolve } from '$app/paths'
import { DOC_MARKDOWN_PARTS, DOC_SLUGS, DOC_TREE } from '../content'
import { DOC_SOURCES } from '../content/sources.server'
import { readFrontmatter, readSections } from './parse'
import { docToMarkdown } from './toMarkdown'
import type { Doc, DocNavGroup, DocPage } from './types'

/**
 * Le seul module du moteur qui connaisse le contenu: il lit l'arbre, les sources et les jumeaux
 * markdown, et n'expose que des `Doc`. Tout le reste du moteur ignore ce qu'il sert.
 *
 * Le registre est construit une fois pour toutes, à l'import: les sources sont figées à la
 * compilation.
 */
const docs = new Map<string, Doc>(
	DOC_SLUGS.map((slug) => {
		const source = DOC_SOURCES[slug]
		// Une entrée de `DOC_TREE` sans fichier ne peut pas se rattraper à l'exécution: elle
		// laisserait un lien mort dans la navigation de toutes les pages.
		if (source === undefined) throw new Error(`Page de documentation introuvable: ${slug}.svx`)

		const { data, body } = readFrontmatter(source)
		const title = data.title || slug
		return [
			slug,
			{
				slug,
				path: resolve('/(home)/docs/[...slug]', { slug }),
				title,
				label: data.label || title,
				description: data.description || '',
				sections: readSections(body),
				source,
			},
		]
	})
)

export function getDoc(slug: string): Doc | undefined {
	return docs.get(slug)
}

export function getDocs(): Doc[] {
	return DOC_SLUGS.map((slug) => docs.get(slug)!)
}

export function getDocNav(): DocNavGroup[] {
	return DOC_TREE.map(({ label, slugs }) => ({
		label,
		pages: slugs.map(asDocPage),
	}))
}

/**
 * Les pages qui encadrent celle-ci dans l'ordre de lecture, groupes traversés. Réduites à leur
 * identité: la source d'une page voisine n'a rien à faire au navigateur.
 */
export function getDocNeighbours(slug: string) {
	const index = DOC_SLUGS.indexOf(slug)
	return {
		previous: index > 0 ? asDocPage(DOC_SLUGS[index - 1]) : undefined,
		next: index < DOC_SLUGS.length - 1 ? asDocPage(DOC_SLUGS[index + 1]) : undefined,
	}
}

function asDocPage(slug: string): DocPage {
	const { path, label } = docs.get(slug)!
	return { slug, path, label }
}

export function getDocMarkdown(slug: string): string | undefined {
	const doc = docs.get(slug)
	return doc && docToMarkdown(doc.source, DOC_MARKDOWN_PARTS)
}
