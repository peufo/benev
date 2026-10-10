<script lang="ts">
	import VideoCarousel from './VideoCarousel.svelte'
	import { activeVideoIndex } from './videoStore'
	import manifest from './videos.json'

	/** Servies par `/media/demos`, déposées par `bun run demo:publish`. */
	const demo = (id: keyof typeof manifest, title: string) => ({ ...manifest[id], title })

	const steps = [
		{
			number: '01',
			title: "Création de l'événement",
			description:
				'Configure les secteurs, les créneaux et les besoins en bénévoles. Chaque événement a son propre mini-site avec des pages personnalisables pour centraliser toute la communication.',
			videos: [
				demo('create-space', "Créer l'événement et son identité"),
				demo('create-pages', 'Créer la charte et les pages'),
				demo('create-teams', 'Créer les secteurs'),
				demo('planif', 'Planifier les créneaux'),
			],
		},
		{
			number: '02',
			title: 'Inscription et validation',
			description:
				'Laisse les bénévoles choisir leurs créneaux en autonomie. Ou garde le contrôle et gère les inscriptions toi-même.',
			videos: [
				demo('config-fields', "Configuration de l'adhésion"),
				demo('subscribe', "Inscription d'un bénévole"),
				demo('subscribe-validation', 'Valider une inscription'),
			],
		},
		{
			number: '03',
			title: 'Suivi et organisation',
			description:
				'Consulte et exporte la liste des bénévoles, les créneaux et les contacts en quelques clics. Imprime les feuilles de secteur et les badges pour le jour J.',
			videos: [
				demo('create-view', 'Créer des vues'),
				demo('export-data', 'Exporter les données'),
				demo('team-pdf', "Imprimer la feuille d'un secteur"),
				demo('badges', 'Créer et imprimer les badges'),
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
				Trois étapes simples pour se débarrasser de tes fichiers Excel.
			</p>
		</div>

		<div class="flex flex-col gap-20 md:gap-28">
			{#each steps as step, i (step.number)}
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
