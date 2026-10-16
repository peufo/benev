/**
 * Ce que benevio fait, pour ce qui indexe: le JSON-LD de l'accueil en tire son `featureList` et
 * `llms.txt` sa section « Fonctionnalités ». Les personnes, elles, lisent la documentation. Chaque
 * entrée renvoie au chapitre qui l'explique, et un test vérifie que la page et l'ancre existent.
 */
export type Feature = {
	name: string
	description: string
	/** `/docs/<slug>`, suivi au besoin de l'ancre d'un `##` */
	doc: `/docs/${string}`
}

export type FeatureGroup = { title: string; features: Feature[] }

export const FEATURE_GROUPS: FeatureGroup[] = [
	{
		title: 'Préparer',
		features: [
			{
				name: "Le site de l'évènement",
				description:
					"Un mini-site à tes couleurs : page d'accueil, FAQ, plan d'accès et charte des bénévoles.",
				doc: '/docs/creer-ton-evenement#publications',
			},
			{
				name: 'La planification des créneaux',
				description:
					'Une grille où un cliquer-glisser ajoute un créneau, avec étiquettes, jalons et « Dupliquer après ».',
				doc: '/docs/creer-ton-evenement#periodes',
			},
			{
				name: "Le formulaire d'adhésion",
				description:
					'Tes propres questions en plus du nom et du courriel : taille de t-shirt, régime alimentaire, permis.',
				doc: '/docs/ouvrir-les-inscriptions#adhesion',
			},
			{
				name: "Les conditions d'accès",
				description:
					'Le bar réservé aux majeur·es, la navette à qui a le permis : chaque secteur fait son tri tout seul.',
				doc: '/docs/ouvrir-les-inscriptions#conditions',
			},
			{
				name: 'Les responsables de secteur',
				description:
					"Chaque secteur a ses responsables, qui valident les inscriptions sans voir le reste de l'évènement.",
				doc: '/docs/ton-equipe#roles',
			},
			{
				name: "La reprise d'une édition",
				description:
					"Secteurs, questions et pages de l'an dernier, toutes les dates décalées d'un coup.",
				doc: '/docs/creer-ton-evenement#dupliquer',
			},
		],
	},
	{
		title: 'Recruter',
		features: [
			{
				name: "L'inscription en libre-service",
				description:
					'Les bénévoles choisissent leurs créneaux eux-mêmes, ou tes responsables les inscrivent à la main.',
				doc: '/docs/ouvrir-les-inscriptions#autonomie',
			},
			{
				name: "La liste d'attente",
				description:
					'Un secteur accepte plus de demandes que de places, et tu valides au fil des réponses.',
				doc: '/docs/creer-ton-evenement#periodes',
			},
			{
				name: 'Les courriels personnalisés',
				description:
					"Réécris les messages envoyés à tes bénévoles, avec leur prénom, leur créneau et leurs réponses insérés à l'envoi.",
				doc: '/docs/configuration-avancee#courriels',
			},
			{
				name: 'Le tableau de bord et le journal',
				description:
					'Les nouvelles arrivées, les demandes en attente, le remplissage de chaque secteur et tout ce qui a bougé.',
				doc: '/docs/gestion',
			},
			{
				name: 'Les tables et les vues',
				description:
					"Filtre tes membres et leurs inscriptions sur n'importe quelle réponse, et garde tes filtres pour la prochaine fois.",
				doc: '/docs/gestion#vues',
			},
		],
	},
	{
		title: 'Le jour J',
		features: [
			{
				name: 'Les rappels automatiques',
				description:
					'Un courriel avant chaque créneau, la veille ou deux heures avant, qui suit le créneau si son horaire bouge.',
				doc: '/docs/le-jour-j#rappels',
			},
			{
				name: 'Les badges imprimables',
				description:
					"Des cartes nominatives avec photo, couleur par fonction, grilles d'accès et QR code, en PDF.",
				doc: '/docs/configuration-avancee#badges',
			},
			{
				name: 'Les exports et les feuilles de secteur',
				description:
					'CSV, contacts pour le téléphone, et un PDF par secteur avec les inscrit·es de chaque créneau.',
				doc: '/docs/le-jour-j#exports',
			},
			{
				name: 'Le pointage des présences',
				description:
					'Les absences se notent créneau par créneau, et se retrouvent dans tes filtres.',
				doc: '/docs/le-jour-j#presences',
			},
			{
				name: "L'agenda personnel",
				description: 'Chaque bénévole ajoute ses créneaux à son propre agenda.',
				doc: '/docs/le-jour-j#agenda',
			},
		],
	},
]

export const FEATURES: Feature[] = FEATURE_GROUPS.flatMap(({ features }) => features)
