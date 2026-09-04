import { readFrontmatter } from './parse'

/**
 * Rend une page de documentation en markdown pur, pour les URL `.md` et les fichiers `llms*.txt`.
 * La source en est déjà: il ne reste qu'à lui rendre son titre et à faire disparaître ce qui
 * n'appartient qu'à Svelte.
 *
 * Les jumeaux sont passés en argument plutôt que lus du contenu: la conversion n'a pas à savoir
 * quels composants existent, seulement comment les remplacer.
 */
export function docToMarkdown(source: string, parts: Record<string, () => string>): string {
	const { data, body } = readFrontmatter(source)

	const markdown = body
		.replace(/<script[\s\S]*?<\/script>/g, '')
		// L'ancre figée d'un chapitre est une adresse, pas du contenu. `[ \t]` et non `\s`: en mode
		// multiligne, ce dernier avalerait la ligne vide qui suit le titre.
		.replace(/^(##[^#].*?)[ \t]*\{#[A-Za-z0-9_-]+\}[ \t]*$/gm, '$1')
		// Un composant sans jumeau est laissé tel quel plutôt que supprimé: la balise reste visible
		// dans le markdown servi, et le test de couverture du registre échoue avant qu'elle n'y
		// arrive.
		.replace(/<([A-Z][A-Za-z0-9]*)\b[^>]*\/>/g, (tag, name: string) => parts[name]?.() ?? tag)
		.replace(/\n{3,}/g, '\n\n')
		.trim()

	return `${data.title ? `# ${data.title}\n\n` : ''}${markdown}\n`
}
