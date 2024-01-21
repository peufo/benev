<script lang="ts">
	import {
		mdiAccountGroupOutline,
		mdiChevronDown,
		mdiDatabaseOutline,
		mdiEmailOutline,
		mdiEyeOutline,
		mdiGiftOutline,
		mdiLicense,
		mdiLogin,
		mdiWeb,
	} from '@mdi/js'
	import { CardBasic, Icon } from '$lib/material'
	import '$lib/style/animate.css'

	export let title = 'Les possibilités'
	const titleLength = title.length

	const ANIMATION_STEP = 40

	type Feature = {
		name: string
		icon: string
		description: string
		comingSoon?: string
	}

	const features: Feature[] = [
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
</script>

<section class="mt-8 mb-10 max-w-7xl mx-auto">
	<div class="flex justify-center gap-4">
		<Icon
			path={mdiChevronDown}
			size={30}
			class="opacity-60 animate__pulse"
			style="
				--animate-rotate: {(titleLength / 2) * -2}deg;
			"
		/>
		<h2 class="title text-2xl">
			{#each title.split('') as char, index}
				<span
					class="inline-block animate__pulse"
					class:mr-2={char === ' '}
					style="
						--animate-delay: {ANIMATION_STEP * (index + 1)}ms;
						--animate-rotate: {(titleLength / 2 - index) * -2}deg;
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
				--animate-delay: {(titleLength + 2) * ANIMATION_STEP}ms;
				--animate-rotate: {(titleLength / 2) * 2}deg;
			"
		/>
	</div>
	<div
		class="grid gap-4 items-start overflow-auto mt-14"
		style:grid-template-columns="repeat(auto-fill, minmax(min(20rem, 100%), 1fr)"
	>
		{#each features as feat}
			<CardBasic class="shadow p-5">
				<div class="flex flex-wrap gap-4 items-center">
					<Icon path={feat.icon} size={30}  class="opacity-70 p-1 border rounded bg-base-200"/>
					<h2 class="font-medium">
						{feat.name}
					</h2>
					<div class="grow" />
				</div>
				<p class="mt-3 opacity-80">
					{feat.description}
				</p>
				{#if feat.comingSoon}
					<span class="badge bg-base-200 mt-3">{feat.comingSoon}</span>
				{/if}
			</CardBasic>
		{/each}
	</div>
</section>
