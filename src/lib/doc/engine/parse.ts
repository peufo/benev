import type { TocSection } from '$lib/ui'
import { createSlugger } from './slug.js'

/**
 * Lecture du frontmatter d'une page: des scalaires `clé: valeur` sur une ligne, rien d'autre. Ni
 * listes, ni valeurs sur plusieurs lignes — mdsvex en accepterait, mais une page de documentation
 * n'a besoin que de son titre et de sa description.
 */
export function readFrontmatter(source: string): { data: Record<string, string>; body: string } {
	const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source)
	if (!match) return { data: {}, body: source }

	const data: Record<string, string> = {}
	for (const line of match[1].split(/\r?\n/)) {
		const separator = line.indexOf(':')
		if (separator === -1) continue
		const key = line.slice(0, separator).trim()
		const value = line.slice(separator + 1).trim()
		if (key) data[key] = value.replace(/^(['"])([\s\S]*)\1$/, '$2')
	}
	return { data, body: source.slice(match[0].length) }
}

/**
 * Les chapitres d'une page sont ses titres de niveau deux, dans l'ordre du fichier. L'ancre est
 * dérivée du titre par `createSlugger`, celui-là même qu'emploie le greffon de rendu: les deux
 * parcourent le même ordre et tombent donc sur les mêmes identifiants, doublons compris.
 */
export function readSections(body: string): TocSection[] {
	const nextSection = createSlugger()
	const sections: TocSection[] = []

	for (const line of codeFreeLines(body)) {
		const heading = /^##[^#](.*)$/.exec(line)
		if (!heading) continue
		const { title, id } = nextSection(heading[1])
		sections.push({ id, label: typographic(title) })
	}
	return sections
}

/** Les composants employés dans la page — ceux dont la surface markdown attend un jumeau. */
export function readComponents(body: string): string[] {
	const names = new Set<string>()
	for (const [, name] of body.matchAll(/<([A-Z][A-Za-z0-9]*)/g)) names.add(name)
	return [...names]
}

/** Un `##` dans un bloc de code clôturé n'est pas un titre. */
function* codeFreeLines(body: string): Generator<string> {
	let fence = ''
	for (const line of body.split(/\r?\n/)) {
		const delimiter = /^\s*(```+|~~~+)/.exec(line)?.[1]
		if (fence) {
			if (delimiter?.startsWith(fence[0])) fence = ''
			continue
		}
		if (delimiter) {
			fence = delimiter
			continue
		}
		yield line
	}
}

/**
 * mdsvex courbe les apostrophes du titre rendu (smartypants). Le sommaire lit la source: sans cette
 * substitution, il écrirait le titre autrement que la page. Les ancres, elles, ne s'en soucient pas
 * — `slugify` réduit toute ponctuation à un tiret.
 */
function typographic(title: string): string {
	return title.replace(/'/g, '’')
}
