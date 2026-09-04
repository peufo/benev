import { createSlugger } from './slug.js'

/**
 * Découpe une page de documentation en chapitres: chaque `##` ouvre une surface, et l'auteur
 * n'écrit que du markdown. Le greffon s'insère entre `remark2rehype` et la stringification, deux
 * étapes que mdsvex configure en `allowDangerousHtml` — les nœuds bruts en ressortent intacts.
 *
 * Ce module est en JavaScript parce que `svelte.config.js` l'importe, et que Node ne charge pas de
 * TypeScript. Il est typé en JSDoc, `checkJs` s'applique.
 *
 * @typedef {object} HastNode
 * @property {string} type
 * @property {string} [value]
 * @property {string} [tagName]
 * @property {Record<string, unknown>} [properties]
 * @property {HastNode[]} [children]
 */

/** Reprises de `Section.svelte`: une page de documentation n'a plus le composant, mais son allure. */
const SECTION_CLASS = ['surface', 'scroll-mt-4', 'p-5', 'space-y-4']
const BODY_CLASS = ['prose', 'max-w-none']

/**
 * Ce que Svelte exige au premier niveau du composant. mdsvex les remonte en tête après nous, par
 * `extract_parts`: enfermées dans une `<section>`, ces balises deviendraient du HTML mort et
 * l'import des composants de contenu disparaîtrait. Elles arrivent tantôt en `raw`, tantôt en
 * `text` selon le tokeniseur qui les a reconnues — d'où le test sur la valeur et non sur le type.
 */
const TOP_LEVEL = /^\s*<(script|style|svelte:)/i

export default function rehypeDocSections() {
	/** @param {HastNode} tree */
	return (tree) => {
		const nextSection = createSlugger()
		/** @type {HastNode[]} */
		const roots = []
		/** @type {HastNode[]} Le chapeau: ce qui précède le premier titre, hors carte. */
		let lede = []
		/** @type {HastNode | null} Le corps du chapitre en cours. */
		let body = null

		const flushLede = () => {
			if (lede.some(hasContent)) roots.push(element('div', { className: BODY_CLASS }, lede))
			lede = []
		}

		for (const node of tree.children ?? []) {
			if (typeof node.value === 'string' && TOP_LEVEL.test(node.value)) {
				roots.push(node)
				continue
			}

			if (node.type === 'element' && node.tagName === 'h2') {
				flushLede()
				const { title, id } = nextSection(readText(node))
				stripAnchor(node, title)
				node.properties = { ...node.properties, className: ['title'] }
				body = element('div', { className: BODY_CLASS }, [])
				roots.push(element('section', { id, className: SECTION_CLASS }, [node, body]))
				continue
			}

			if (body) body.children?.push(node)
			else lede.push(node)
		}

		// Une page sans aucun `##` reste lisible: tout son contenu devient le chapeau.
		flushLede()
		tree.children = roots
	}
}

/**
 * @param {string} tagName
 * @param {Record<string, unknown>} properties
 * @param {HastNode[]} children
 * @returns {HastNode}
 */
function element(tagName, properties, children) {
	return { type: 'element', tagName, properties, children }
}

/** Un blanc entre deux éléments ne fait pas un chapeau. @param {HastNode} node */
function hasContent(node) {
	return node.type !== 'text' || (node.value ?? '').trim() !== ''
}

/** @param {HastNode} node @returns {HastNode[]} */
function textNodes(node) {
	if (node.type === 'text') return [node]
	return (node.children ?? []).flatMap(textNodes)
}

/** @param {HastNode} node */
function readText(node) {
	return textNodes(node)
		.map(({ value }) => value ?? '')
		.join('')
}

/**
 * Retire le `{#ancre}` du titre rendu, sans toucher au reste: le titre garde son balisage en ligne,
 * et Svelte ne voit jamais les accolades, qu'il prendrait pour l'ouverture d'un bloc.
 *
 * @param {HastNode} node
 * @param {string} title
 */
function stripAnchor(node, title) {
	const texts = textNodes(node)
	const last = texts[texts.length - 1]
	if (!last || readText(node).trim() === title) return
	last.value = (last.value ?? '').replace(/\s*\{#[A-Za-z0-9_-]+\}\s*$/, '')
}
