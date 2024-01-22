import {
	mdiAccountGroupOutline,
	mdiDatabaseOutline,
	mdiEmailOutline,
	mdiEyeOutline,
	mdiGiftOutline,
	mdiLicense,
	mdiLogin,
	mdiViewDashboardOutline,
	mdiWeb,
} from '@mdi/js'

type Feature = {
	name: string
	icon: string
	description: string
	comingSoon?: string
}

export { default as Features } from '$lib/features/Features.svelte'

export const features: Feature[] = [
	{
		name: 'Espace dédié',
		icon: mdiWeb,
		description:
			'Créer un site pour centraliser la communication et la planification de ton évènement.',
	},
	{
		name: 'Base de donnée des membres',
		icon: mdiDatabaseOutline,
		description: 'Définit librement les informations que tu souhaites récolter ou renseigner.',
	},
	{
		name: "Processus d'adhésion flexible",
		icon: mdiLogin,
		description:
			"Automatise ta planification en autorisant l'inscription autonome des membres toutes en gardant le contrôle sur les secteurs sensibles.",
	},
	{
		name: "Travail d'équipe",
		icon: mdiAccountGroupOutline,
		description:
			"Entoure-toi d'administrateurs et de responsables de secteurs pour t'aider dans la gestion.",
	},
	{
		name: 'Documents opérationnels',
		icon: mdiEyeOutline,
		description: "Visualise ou exporte les vues essentiels au bon déroulement de l'organisation.",
	},
	{
		name: 'Tableau de bord bénévole',
		icon: mdiViewDashboardOutline,
		description: 'Chaque bénévole peut retrouve en tout temps ses informations.',
	},
	{
		name: 'Charte des bénévole',
		icon: mdiLicense,
		description:
			'Définit une charte à laquelle les bénévoles devront adhérer lors de leur inscription.',
		comingSoon: 'Disponible en Février 2024',
	},
	{
		name: 'Système de compensation',
		icon: mdiGiftOutline,
		description:
			"Définit des articles et les règles d'éligibilitées pour générer des liste d'attribution.",
		comingSoon: 'Disponible en Février 2024',
	},
	{
		name: 'Communication',
		icon: mdiEmailOutline,
		description: 'Personnalise tes notifications par email et édite des publipostage.',
		comingSoon: 'Disponible en Mars 2024',
	},
]
