export type LegalDoc = { path: string; label: string; description: string }

/**
 * Les quatre textes se citent mutuellement et sont listés dans le pied de page. Une seule
 * définition évite qu'un renvoi pointe dans le vide, et garantit que le libellé du lien, le
 * titre de la page et son `<h1>` restent le même mot.
 */
export const LEGAL_DOCS: LegalDoc[] = [
	{
		path: '/terms',
		label: 'Conditions générales',
		description:
			`Conditions générales d'utilisation de benevio : ton compte, les contenus publiés, ` +
			`les obligations des organisateurs, la responsabilité et le droit applicable.`,
	},
	{
		path: '/privacy',
		label: 'Confidentialité',
		description:
			`Quelles données benevio collecte, pourquoi, qui y a accès, combien de temps elles sont ` +
			`conservées, à quels sous-traitants elles sont confiées et comment exercer tes droits.`,
	},
	{
		path: '/legal-notice',
		label: 'Mentions légales',
		description: `Éditeur, hébergeur, contact et propriété intellectuelle du service benevio.`,
	},
	{
		path: '/sales-terms',
		label: 'Conditions de vente',
		description:
			`Conditions générales de vente de benevio : offres et quotas, achat unique sans ` +
			`reconduction, paiement, droit de rétractation de 14 jours et support.`,
	},
]

/** Identité de l'éditeur, citée par les trois textes qui l'engagent. */
export const LEGAL_ENTITY = {
	name: 'Dev Voisard',
	ide: 'CHE-400.730.052',
	street: 'Sur Ville 72',
	locality: '2864 Soulce',
	country: 'Suisse',
	email: 'legal@benev.io',
} as const

/** Récupère un document par sa route, pour que ses métas et son titre viennent de la même source. */
export function legalDoc(path: string): LegalDoc {
	const doc = LEGAL_DOCS.find((d) => d.path === path)
	if (!doc) throw new Error(`Document légal inconnu: ${path}`)
	return doc
}
