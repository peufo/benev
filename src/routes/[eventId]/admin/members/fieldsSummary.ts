/**
 * Clé de synthèse d'une réponse à un champ `multiselect` compté par combinaisons.
 *
 * Les valeurs sont stockées dans l'ordre où le membre les a cochées: « B, A » et « A, B » sont la
 * même réponse et doivent tomber sur la même ligne. On les range donc dans l'ordre des options du
 * champ, les valeurs qui n'y figurent plus à la fin. La clé est du JSON, et non un libellé joint:
 * la ligne de la synthèse la renvoie telle quelle au filtre `field_<id>`, qui relit un tableau.
 */
export function combinationKey(values: string[], options: string[]): string {
	const rank = (value: string) => {
		const index = options.indexOf(value)
		return index === -1 ? options.length : index
	}
	const sorted = [...values].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
	return JSON.stringify(sorted)
}
