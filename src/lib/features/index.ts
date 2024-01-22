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

import accountPng from '$lib/assets/icons/account-group-outline.png'
import databasePng from '$lib/assets/icons/database-outline.png'
import emailPng from '$lib/assets/icons/email-outline.png'
import eyePng from '$lib/assets/icons/eye-outline.png'
import giftPng from '$lib/assets/icons/gift-outline.png'
import licensePng from '$lib/assets/icons/license.png'
import loginPng from '$lib/assets/icons/login.png'
import dashboardPng from '$lib/assets/icons/view-dashboard-outline.png'
import webPng from '$lib/assets/icons/web.png'

type Feature = {
	name: string
	icon: string
	src: string
	description: string
	comingSoon?: string
}

export { default as Features } from '$lib/features/Features.svelte'

export const features: Feature[] = [
	{
		name: 'Espace dédié',
		icon: mdiWeb,
		src: webPng,
		description:
			'Créer un site pour centraliser la communication et la planification de ton évènement.',
	},
	{
		name: 'Base de donnée des membres',
		icon: mdiDatabaseOutline,
		src: databasePng,
		description: 'Définit librement les informations que tu souhaites récolter ou renseigner.',
	},
	{
		name: "Processus d'adhésion flexible",
		icon: mdiLogin,
		src: loginPng,
		description:
			"Automatise ta planification en autorisant l'inscription autonome des membres toutes en gardant le contrôle sur les secteurs sensibles.",
	},
	{
		name: "Travail d'équipe",
		icon: mdiAccountGroupOutline,
		src: accountPng,
		description:
			"Entoure-toi d'administrateurs et de responsables de secteurs pour t'aider dans la gestion.",
	},
	{
		name: 'Documents opérationnels',
		icon: mdiEyeOutline,
		src: eyePng,
		description: "Visualise ou exporte les vues essentiels au bon déroulement de l'organisation.",
	},
	{
		name: 'Tableau de bord bénévole',
		icon: mdiViewDashboardOutline,
		src: dashboardPng,
		description: 'Chaque bénévole peut retrouve en tout temps ses informations.',
	},
	{
		name: 'Charte des bénévole',
		icon: mdiLicense,
		src: licensePng,
		description:
			'Définit une charte à laquelle les bénévoles devront adhérer lors de leur inscription.',
		comingSoon: 'Disponible en Février 2024',
	},
	{
		name: 'Système de compensation',
		icon: mdiGiftOutline,
		src: giftPng,
		description:
			"Définit des articles et les règles d'éligibilitées pour générer des liste d'attribution.",
		comingSoon: 'Disponible en Février 2024',
	},
	{
		name: 'Communication',
		icon: mdiEmailOutline,
		src: emailPng,
		description: 'Personnalise tes notifications par email et édite des publipostage.',
		comingSoon: 'Disponible en Mars 2024',
	},
]
