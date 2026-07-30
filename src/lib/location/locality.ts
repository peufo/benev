/**
 * Réduit un libellé de lieu à sa localité, pour les listes où l'adresse complète
 * n'entre pas et se ferait tronquer en plein milieu.
 *
 * Les libellés viennent de Photon et suivent la forme «rue, NPA localité, pays».
 * On retient le segment porteur du code postal, qui est celui qu'un bénévole
 * cherche du regard; à défaut, le premier segment (souvent un nom de lieu-dit).
 */
export function locality(label: string): string {
	const segments = label
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean)
	if (!segments.length) return ''

	// NPA: 4 à 5 chiffres en tête de segment (CH, FR, DE…), suivis du nom.
	const withPostalCode = segments.find((s) => /^\d{4,5}\s+\S/.test(s))
	if (withPostalCode) return withPostalCode.replace(/^\d{4,5}\s+/, '')

	return segments[0]
}
