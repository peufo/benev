import { describe, it } from 'vitest'
import { createSlugger, readHeading, slugify } from '../lib/doc/engine/slug.js'
import { readComponents, readFrontmatter, readSections } from '../lib/doc/engine/parse'
import { docToMarkdown } from '../lib/doc/engine/toMarkdown'
import { DOC_MARKDOWN_PARTS, DOC_SLUGS } from '../lib/doc/content'

/**
 * Les sources de la documentation, lues comme le fait `registry.server.ts`. Le test tourne sur les
 * fichiers réels: un `.svx` mal formé ne doit pas attendre le navigateur pour se signaler.
 */
const sources = import.meta.glob<string>('../lib/doc/content/**/*.svx', {
	query: '?raw',
	import: 'default',
	eager: true,
})

const pages = DOC_SLUGS.map((slug) => ({
	slug,
	source: sources[`../lib/doc/content/${slug}.svx`],
}))

describe('ancres', () => {
	it('réduit un titre à une adresse lisible', ({ expect }) => {
		expect(slugify('Le vocabulaire')).toBe('le-vocabulaire')
		expect(slugify('Qui peut faire quoi ?')).toBe('qui-peut-faire-quoi')
		expect(slugify('Évènement')).toBe('evenement')
	})

	/** mdsvex courbe les apostrophes: les deux formes doivent mener au même endroit. */
	it("ne distingue pas l'apostrophe droite de la courbe", ({ expect }) => {
		expect(slugify("L'adhésion")).toBe(slugify('L’adhésion'))
		expect(slugify("L'adhésion")).toBe('l-adhesion')
	})

	it('lit une ancre figée et la retire du titre', ({ expect }) => {
		expect(readHeading("L'adhésion {#adhesion}")).toEqual({
			title: "L'adhésion",
			id: 'adhesion',
		})
		expect(readHeading('Sans ancre')).toEqual({ title: 'Sans ancre', id: undefined })
	})

	it('numérote les titres qui se répètent', ({ expect }) => {
		const next = createSlugger()
		expect(next('Secteur').id).toBe('secteur')
		expect(next('Secteur').id).toBe('secteur-2')
		expect(next('Secteur').id).toBe('secteur-3')
	})

	it('donne une adresse à un titre qui n’a aucun caractère utilisable', ({ expect }) => {
		expect(createSlugger()('!!!').id).toBe('section')
	})
})

describe('lecture des sources de documentation', () => {
	it('associe un fichier à chaque entrée du registre', ({ expect }) => {
		for (const { slug, source } of pages) expect(source, slug).toBeTypeOf('string')
	})

	it('lit un frontmatter de scalaires et rend le corps', ({ expect }) => {
		const { data, body } = readFrontmatter(
			[
				'---',
				'title: Le vocabulaire',
				'description: Six mots: pas plus',
				'---',
				'',
				'## Corps',
			].join('\n')
		)
		expect(data).toEqual({ title: 'Le vocabulaire', description: 'Six mots: pas plus' })
		expect(body.trim()).toBe('## Corps')
	})

	it("rend la source telle quelle quand il n'y a pas de frontmatter", ({ expect }) => {
		expect(readFrontmatter('## Corps')).toEqual({ data: {}, body: '## Corps' })
	})

	it('ne retient que les titres de niveau deux', ({ expect }) => {
		const sections = readSections('# Un\n\n## Deux\n\n### Trois\n\n## Quatre')
		expect(sections).toEqual([
			{ id: 'deux', label: 'Deux' },
			{ id: 'quatre', label: 'Quatre' },
		])
	})

	it("ignore un `##` qui n'est que du code", ({ expect }) => {
		const body = ['## Vrai titre', '', '```bash', '## pas un titre', '```', '', '## Autre'].join(
			'\n'
		)
		expect(readSections(body).map(({ label }) => label)).toEqual(['Vrai titre', 'Autre'])
	})

	it('emploie une ancre figée quand le titre en déclare une', ({ expect }) => {
		expect(readSections("## L'adhésion {#adhesion}")).toEqual([
			{ id: 'adhesion', label: 'L’adhésion' },
		])
	})

	it('écrit le libellé comme la page le rend', ({ expect }) => {
		expect(readSections("## Ton espace en ligne\n\n## L'adhésion")).toEqual([
			{ id: 'ton-espace-en-ligne', label: 'Ton espace en ligne' },
			{ id: 'l-adhesion', label: 'L’adhésion' },
		])
	})

	it('donne à chaque page un titre, une description et des chapitres', ({ expect }) => {
		for (const { slug, source } of pages) {
			const { data, body } = readFrontmatter(source)
			expect(data.title, slug).toBeTruthy()
			expect(data.description, slug).toBeTruthy()
			expect(readSections(body).length, slug).toBeGreaterThan(0)
		}
	})

	it('ne donne jamais deux chapitres au même identifiant', ({ expect }) => {
		for (const { slug, source } of pages) {
			const ids = readSections(source).map(({ id }) => id)
			expect(new Set(ids).size, slug).toBe(ids.length)
		}
	})
})

describe('surface markdown', () => {
	/**
	 * L'invariant du module: sans jumeau, un composant traverserait la conversion sans rien rendre
	 * et le `.md` servi perdrait ce morceau en silence.
	 */
	it('donne un jumeau markdown à chaque composant employé', ({ expect }) => {
		for (const { slug, source } of pages) {
			for (const name of readComponents(source)) {
				expect(DOC_MARKDOWN_PARTS, `${slug} emploie <${name}>`).toHaveProperty(name)
			}
		}
	})

	it('rend un markdown sans frontmatter, sans script et sans balise', ({ expect }) => {
		for (const { slug, source } of pages) {
			const markdown = docToMarkdown(source, DOC_MARKDOWN_PARTS)
			const { data } = readFrontmatter(source)
			expect(markdown, slug).toMatch(`# ${data.title}`)
			expect(markdown, slug).not.toContain('---\ntitle:')
			expect(markdown, slug).not.toContain('<script')
			expect(markdown, slug).not.toMatch(/<[A-Z]/)
			expect(markdown, slug).not.toMatch(/\{#[a-z-]+\}/)
		}
	})

	it('garde les titres de la source et leur pose un titre de page', ({ expect }) => {
		const markdown = docToMarkdown(
			['---', 'title: T', '---', '', "## L'adhésion {#adhesion}", '', 'Texte'].join('\n'),
			DOC_MARKDOWN_PARTS
		)
		expect(markdown).toBe("# T\n\n## L'adhésion\n\nTexte\n")
	})

	it('remplace un composant par son jumeau', ({ expect }) => {
		const markdown = docToMarkdown('---\ntitle: T\n---\n<WhoCanDoWhat />\n', DOC_MARKDOWN_PARTS)
		expect(markdown).toContain('| Qui peut faire quoi ? | Propriétaire |')
		expect(markdown).toContain('| Nommer des administrateur·ices | oui | non | non | non |')
	})
})

describe("règles d'écriture", () => {
	/**
	 * Le rendu ouvre une carte à chaque `##`: ce qui précède le premier titre flotterait hors de
	 * toute carte. Les balises de premier niveau ne comptent pas — mdsvex les remonte en tête du
	 * composant, et le greffon les laisse à la racine.
	 */
	it('ne met rien avant le premier chapitre', ({ expect }) => {
		for (const { slug, source } of pages) {
			const { body } = readFrontmatter(source)
			const lede = body.replace(/<script[\s\S]*?<\/script>/g, '').split(/^##[^#]/m)[0]
			expect(lede.trim(), slug).toBe('')
		}
	})

	/**
	 * Un renvoi mort ne se voit qu'en le suivant. Le registre sait quelles pages existent et quelles
	 * ancres elles offrent: autant le lui demander ici.
	 */
	it('ne renvoie qu’à des pages et des ancres qui existent', ({ expect }) => {
		const anchors = new Map(
			pages.map(({ slug, source }) => [slug, readSections(source).map(({ id }) => id)])
		)

		for (const { slug, source } of pages) {
			for (const [, href] of source.matchAll(/\]\((\/docs[^)\s]*)\)/g)) {
				const [path, anchor] = href.split('#')
				const target = path.replace(/^\/docs\/?/, '')
				// L'index de la documentation n'a ni slug ni ancre à vérifier.
				if (!target) continue
				const where = `${slug} renvoie à ${href}`
				expect(DOC_SLUGS, where).toContain(target)
				if (anchor) expect(anchors.get(target) ?? [], where).toContain(anchor)
			}
		}
	})
})
