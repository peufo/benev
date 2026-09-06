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
		label: 'Découvrir',
		slugs: [
			'decouvrir/vue-d-ensemble',
			'decouvrir/anatomie',
			'decouvrir/vocabulaire',
			'decouvrir/roles-et-droits',
		],
	},
	{
		label: 'Démarrer',
		slugs: [
			'demarrer/creer-un-evenement',
			'demarrer/secteurs-et-periodes',
			'demarrer/adhesion',
			'demarrer/publier-et-partager',
			'demarrer/suivre-les-inscriptions',
		],
	},
	{
		label: 'Aller plus loin',
		slugs: [
			'avance/comptes-et-membres',
			'avance/filtrer-trier-exporter',
			'avance/conditions-d-acces',
			'avance/modeles-d-email',
			'avance/badges',
			'avance/dupliquer-un-evenement',
		],
	},
]

/** Toutes les pages, dans l'ordre de lecture — celui du précédent/suivant. */
export const DOC_SLUGS = DOC_TREE.flatMap((group) => group.slugs)
