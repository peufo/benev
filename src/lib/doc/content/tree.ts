/**
 * L'ordre de lecture de la documentation, et rien d'autre: titre et description viennent du
 * frontmatter de chaque page, pour qu'ils ne puissent pas diverger de leur contenu.
 *
 * Un slug est le chemin du fichier sous `content/`, sans son extension. Il est **stable**: l'aide
 * contextuelle et les liens partagés pointent dessus, le renommer casse les deux.
 */
export const DOC_SLUGS = [
	'decouvrir',
	'creer-ton-evenement',
	'ton-equipe',
	'ouvrir-les-inscriptions',
	'gestion',
	'le-jour-j',
	'configuration-avancee',
]
