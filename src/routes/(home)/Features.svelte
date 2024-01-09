<script lang="ts">
	import { CardBasic } from '$lib/material'

	type Feature = {
		name: string
		description: string
		comingSoon?: boolean
	}

	const features: Feature[] = [
		{
			name: 'Espace dédié',
			description: 'Centralise la communication et la planification de ton évènement.',
		},
		{
			name: 'Base de donnée des membres',
			description: 'Définit les données que tu souhaites récolter ou renseigner.',
		},
		{
			name: "Processus d'adhésion flexible",
			description:
				"Automatise ta planification en autorisant l'inscription autonome des membres toutes en gardant le contrôle sur les secteurs sensibles.",
		},
		{
			name: "Travail d'équipe",
			description:
				"Nomme des administrateurs et des responsables secteurs pour déléguer la gestion de l'évènement.",
		},
		{
			name: 'Documents opérationnels',
			description:
				"Visualise ou exporte les documents essentiels au bon déroulement de l'organisation.",
		},
		{
			name: 'Communication',
			description: 'Personnalise tes notifications par email et tes publipostage.',
			comingSoon: true,
		},
		{
			name: 'Charte des bénévole',
			description:
				'Définit une charte à laquelle les bénévoles devront adhèrer lors de leur inscription.',
			comingSoon: true,
		},
		{
			name: 'Système de compensation',
			description:
				"Définit des articles et les règles d'éligibilitées pour générer des liste d'attribution",
			comingSoon: true,
		},
	]
</script>

<section class="my-20 max-w-7xl mx-auto">
	<h2 class="title text-2xl text-center mb-10">Les possibilités</h2>
	<div
		class="grid gap-4 items-start overflow-auto"
		style:grid-template-columns="repeat(auto-fill, minmax(min(20rem, 100%), 1fr)"
	>
		{#each features as feat}
			<CardBasic class="shadow">
				<div class="flex flex-wrap gap-2 items-center pb-2">
					<h2 class="font-medium">
						{feat.name}
					</h2>
					<div class="grow" />
					{#if feat.comingSoon}
						<span class="badge bg-base-200">Bientôt disponible</span>
					{/if}
				</div>
				<p class="">
					{feat.description}
				</p>
			</CardBasic>
		{/each}
	</div>
</section>
