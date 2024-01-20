<script lang="ts">
	import { mdiChevronDown } from '@mdi/js'
	import { CardBasic, Icon } from '$lib/material'
	import '$lib/style/animate.css'

	export let title = 'Les possibilités'
	const titleLength = title.length

	const ANIMATION_STEP = 40
	const ANIMATION_DELAY = 3000

	type Feature = {
		name: string
		description: string
		comingSoon?: boolean
	}

	const features: Feature[] = [
		{
			name: 'Espace dédié',
			description:
				'Créer un site pour centraliser la communication et la planification de ton évènement.',
		},
		{
			name: 'Base de donnée des membres',
			description: 'Définit librement les informations que tu souhaites récolter ou renseigner.',
		},
		{
			name: "Processus d'adhésion flexible",
			description:
				"Automatise ta planification en autorisant l'inscription autonome des membres toutes en gardant le contrôle sur les secteurs sensibles.",
		},
		{
			name: "Travail d'équipe",
			description:
				"Entoure-toi d'administrateurs et de responsables de secteurs pour t'aider dans la gestion.",
		},
		{
			name: 'Documents opérationnels',
			description:
				"Visualise ou exporte les documents essentiels au bon déroulement de l'organisation.",
		},
		{
			name: 'Communication',
			description: 'Personnalise tes notifications par email et édite des publipostage.',
			comingSoon: true,
		},
		{
			name: 'Charte des bénévole',
			description:
				'Définit une charte à laquelle les bénévoles devront adhérer lors de leur inscription.',
			comingSoon: true,
		},
		{
			name: 'Système de compensation',
			description:
				"Définit des articles et les règles d'éligibilitées pour générer des liste d'attribution.",
			comingSoon: true,
		},
	]
</script>

<section class="mt-8 mb-10 max-w-7xl mx-auto">
	<div class="flex justify-center gap-4">
		<Icon
			path={mdiChevronDown}
			size={30}
			class="opacity-60 animate__pulse"
			style="
				--animate-delay: {ANIMATION_DELAY}ms;
				--animate-rotate: {(titleLength / 2) * -1.5}deg;
			"
		/>
		<h2 class="title text-2xl">
			{#each title.split('') as char, index}
				<span
					class="inline-block animate__pulse"
					class:mr-2={char === ' '}
					style="
						--animate-delay: {ANIMATION_DELAY + ANIMATION_STEP * (index + 1)}ms;
						--animate-rotate: {((titleLength / 2) - index) * -1.5}deg;
					"
				>
					{char}
				</span>
			{/each}
		</h2>
		<Icon
			path={mdiChevronDown}
			size={30}
			class="opacity-60 animate__pulse"
			style="
				--animate-delay: {ANIMATION_DELAY + (titleLength + 2) * ANIMATION_STEP}ms;
				--animate-rotate: {(titleLength / 2) * 1.5}deg;
			"
		/>
	</div>
	<div
		class="grid gap-4 items-start overflow-auto mt-12"
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
