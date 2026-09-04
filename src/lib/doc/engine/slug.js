/**
 * L'ancre d'un chapitre de documentation, dérivée de son titre.
 *
 * Ce module est en JavaScript et non en TypeScript parce que `svelte.config.js` l'atteint par
 * `rehypeDocSections.js`, et que Node ne charge pas de TypeScript. Il est typé en JSDoc: `checkJs`
 * le passe au crible comme le reste.
 *
 * Toute ponctuation devient un tiret, ce qui rend la fonction insensible à smartypants: le greffon
 * lit `L’adhésion` là où l'extracteur lit `L'adhésion`, et les deux tombent sur `l-adhesion`.
 *
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
	return (
		text
			.normalize('NFD')
			// Les diacritiques, isolés par la décomposition: `é` s'écrit `e` + U+0301.
			.replace(/[̀-ͯ]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
	)
}

/**
 * Un titre de chapitre peut figer son ancre — `## L'adhésion {#adhesion}` — pour survivre à sa
 * propre reformulation. Rend le titre sans le suffixe, et l'ancre si elle est déclarée.
 *
 * @param {string} heading
 * @returns {{ title: string, id: string | undefined }}
 */
export function readHeading(heading) {
	const match = /^([\s\S]*?)\s*\{#([A-Za-z0-9_-]+)\}\s*$/.exec(heading)
	if (!match) return { title: heading.trim(), id: undefined }
	return { title: match[1].trim(), id: match[2] }
}

/**
 * Distribue des ancres uniques dans l'ordre du document. Le greffon et l'extracteur parcourent le
 * même ordre, ils attribuent donc les mêmes suffixes aux titres qui se répètent.
 *
 * @returns {(heading: string) => { title: string, id: string }}
 */
export function createSlugger() {
	/** @type {Map<string, number>} */
	const seen = new Map()

	return (heading) => {
		const { title, id } = readHeading(heading)
		// Une ancre figée est prise telle quelle: c'est l'intérêt d'en écrire une.
		const base = id ?? (slugify(title) || 'section')
		const count = (seen.get(base) ?? 0) + 1
		seen.set(base, count)
		return { title, id: count === 1 ? base : `${base}-${count}` }
	}
}
