<script lang="ts">
	import VideoCarousel from './VideoCarousel.svelte'
	import { activeVideoIndex } from './videoStore'

	const steps = [
		{
			number: '01',
			title: "Création de l'événement",
			description:
				'Configure les équipes, les shifts et les besoins en bénévoles. Chaque événement a son propre mini-site avec des pages personnalisables pour centraliser toute la communication.',
			videos: [
				{ src: '/videos/create-event.mp4', title: "Créer l'événement" },
				{ src: '/videos/edit-theme.mp4', title: 'Personnaliser le thème' },
				{ src: '/videos/create-pages.mp4', title: 'Créer la charte et des pages' },
				{ src: '/videos/edit-theme.mp4', title: 'Créer les secteurs' },
				{ src: '/videos/edit-theme.mp4', title: 'Planifier les shifts' },
			],
		},
		{
			number: '02',
			title: 'Inscription et validation',
			description:
				'Tu peux permettre aux bénévoles de parcourir les secteurs et de choisir leurs créneaux en autonomie. Mais tu peux également garder le contrôle et gérer les inscription à la main.',
			videos: [
				{ src: '/videos/edit-theme.mp4', title: "Configuration de l'adhésion" },
				{ src: '/videos/edit-theme.mp4', title: 'Inscriptions par bénévoles' },
				{ src: '/videos/edit-theme.mp4', title: 'Valider une inscription' },
			],
		},
		{
			number: '03',
			title: 'Suivi et organisation',
			description: 'Toutes les données sont facilement accessible et exportable.',
			videos: [
				{ src: '/videos/create-event.mp4', title: 'Créer une vues pour le planning' },
				{ src: '/videos/edit-theme.mp4', title: 'Suivi des statistiques' },
			],
		},
	]
</script>

<section id="workflow" class="py-20 md:py-28">
	<div class="max-w-6xl mx-auto px-4 sm:px-6">
		<div class="mb-16 md:mb-20">
			<h2 class="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
				Comment ça marche
			</h2>
			<p class="mt-4 text-lg text-base-content/70 max-w-xl">
				Trois étapes simples pour se débarrasser de tes fichiers Excel rudimentaires.
			</p>
		</div>

		<div class="flex flex-col gap-20 md:gap-28">
			{#each steps as step, i}
				{@const isActive = $activeVideoIndex === i}
				<div
					class="grid md:grid-cols-2 gap-10 items-center transition-opacity duration-700"
					class:opacity-100={isActive || $activeVideoIndex === -1}
					class:opacity-40={!isActive && $activeVideoIndex !== -1}
				>
					<!-- Texte -->
					<div class={i % 2 === 1 ? 'md:order-2' : ''}>
						<span
							class="text-7xl md:text-8xl font-extrabold text-primary/10 leading-none select-none"
						>
							{step.number}
						</span>
						<h3 class="text-2xl md:text-3xl font-bold text-primary mt-2 tracking-tight">
							{step.title}
						</h3>
						<p class="mt-4 text-base-content/70 leading-relaxed text-lg max-w-md">
							{step.description}
						</p>
					</div>

					<!-- Visuel animé -->
					<div class={i % 2 === 1 ? 'md:order-1' : ''}>
						<VideoCarousel videos={step.videos} index={i} />
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
