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
				"Automatise ta planification en autorisant l'inscription autonome des membres.\nOu à l'inverse, garde le contrôle en gérant toi-même le entrée pour les secteurs sensible.",
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
				"Définit des articles et règles d'éligibilité pour générer des liste d'attribution",
			comingSoon: true,
		},
	]
</script>

<section class="mb-20">
	<h2 class="title my-10 text-center">Les possibilités</h2>
	<div class="grid grid-cols-2 gap-4 items-start">
		{#each features as feat}
			<CardBasic title={feat.name} class="shadow">
				<p>
					{feat.description}
				</p>
				{#if feat.comingSoon}
					<span class="badge">Bientôt disponible</span>
				{/if}
			</CardBasic>
		{/each}
	</div>
</section>
