/**
 * L'ordre et les groupes de la documentation, et rien d'autre: titre, libellé court et description
 * viennent du frontmatter de chaque page, pour qu'ils ne puissent pas diverger de leur contenu.
 *
 * Un slug est le chemin du fichier sous `content/`, sans son extension. Il est **stable**: l'aide
 * contextuelle et les liens partagés pointent dessus, le renommer casse les deux.
 */
export type DocGroup = { label: string; slugs: string[] }

export const DOC_TREE: DocGroup[] = [
	{
		label: 'Démarrer',
		slugs: ['demarrer/creer-un-evenement', 'demarrer/publier-et-partager'],
	},
	{
		label: 'Concepts',
		slugs: ['concepts/vocabulaire', 'concepts/qui-peut-faire-quoi'],
	},
]

/** Toutes les pages, dans l'ordre de lecture — celui du précédent/suivant. */
export const DOC_SLUGS = DOC_TREE.flatMap((group) => group.slugs)
