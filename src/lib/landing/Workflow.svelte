<script lang="ts">
	import VideoCarousel from './VideoCarousel.svelte'
	import { activeVideoIndex } from './videoStore'

	const steps = [
		{
			number: '01',
			title: 'Tu crées ton événement',
			description:
				'Configure les équipes, les shifts et les besoins en bénévoles. Chaque événement a son propre mini-site avec des pages personnalisables pour centraliser toute la communication.',
			videos: [
				{ src: '/videos/create-event.mp4', title: 'Créer ton événement' },
				{ src: '/videos/edit-theme.mp4', title: 'Personnaliser le thème' },
			],
		},
		{
			number: '02',
			title: "Les bénévoles s'inscrivent",
			description:
				'Ils parcourent les secteurs et choisissent leurs créneaux en autonomie. Chacun gère ses inscriptions, accède à son tableau de bord et reçoit les notifications.',
			videos: [
				{ src: '/videos/create-event.mp4', title: 'Inscription des bénévoles' },
				{ src: '/videos/edit-theme.mp4', title: 'Gestion des créneaux' },
			],
		},
		{
			number: '03',
			title: 'Tu valides et tu organises',
			description:
				"Notification instantanée, validation ou refus en un clic. Désigne des responsables de secteur pour t'aider. Planning rempli, informations accessibles, zéro stress.",
			videos: [
				{ src: '/videos/create-event.mp4', title: 'Valider une inscription' },
				{ src: '/videos/edit-theme.mp4', title: 'Organiser le planning' },
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
