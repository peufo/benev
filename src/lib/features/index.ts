import {
	mdiAccountGroupOutline,
	mdiCardAccountDetailsOutline,
	mdiDatabaseOutline,
	mdiEmailOutline,
	mdiEyeOutline,
	mdiLicense,
	mdiLogin,
	mdiViewDashboardOutline,
	mdiWeb,
} from '@mdi/js'

const accountPng = '/icons/account-group-outline.png'
const databasePng = '/icons/database-outline.png'
const emailPng = '/icons/email-outline.png'
const eyePng = '/icons/eye-outline.png'
const licensePng = '/icons/license.png'
const loginPng = '/icons/login.png'
const dashboardPng = '/icons/view-dashboard-outline.png'
const webPng = '/icons/web.png'

type Feature = {
	name: string
	icon: string
	src: string // @deprecated Only used in EmailProspect
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
			'Crée un site pour centraliser la communication et la planification de ton évènement.',
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
		description: "Visualise ou exporte les vues essentielles au bon déroulement de l'organisation.",
	},
	{
		name: 'Tableau de bord bénévole',
		icon: mdiViewDashboardOutline,
		src: dashboardPng,
		description:
			'Chaque bénévole peut retrouver en tout temps les informations liées à sa participation.',
	},
	{
		name: 'Charte des bénévoles',
		icon: mdiLicense,
		src: licensePng,
		description:
			'Définis une charte à laquelle les bénévoles devront adhérer lors de leur inscription.',
	},
	{
		name: 'Impressions de badges',
		icon: mdiCardAccountDetailsOutline,
		src: 'noop',
		description: "Configure et génère facilement des badges d'accèes à l'image de ton festival.",
	},
	{
		name: 'Communication',
		icon: mdiEmailOutline,
		src: emailPng,
		description: 'Personnalise tes notifications qui seront envoyées aux bénévoles.',
	},
]
