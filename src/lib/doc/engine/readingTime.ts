/** Une vitesse de lecture ordinaire: le chiffre affiché n'est qu'un ordre de grandeur. */
const WORDS_PER_MINUTE = 200

/**
 * Le temps de lecture d'une page, en minutes, jamais moins d'une.
 *
 * Elle attend le markdown converti, et non la source: c'est là que les jumeaux des composants ont
 * remplacé leurs balises, et que le tableau des droits pèse ses dix-sept lignes.
 */
export function readingTime(markdown: string): number {
	const words =
		markdown
			.replace(/<script[\s\S]*?<\/script>/g, ' ')
			.replace(/(```+|~~~+)[\s\S]*?\1/g, ' ')
			// L'adresse d'un lien ne se lit pas, son libellé oui.
			.replace(/\]\([^)]*\)/g, '] ')
			.replace(/<[^>]+>/g, ' ')
			// Un mot peut porter apostrophe ou trait d'union: « d'un » et « au-delà » n'en font qu'un.
			.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)?.length ?? 0

	return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
