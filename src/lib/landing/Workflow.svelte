<script lang="ts">
	import VideoCarousel from './VideoCarousel.svelte'

	const steps = [
		{
			number: '01',
			title: 'Tu crées ton événement',
			description:
				'Configure les équipes, les shifts et les besoins en bénévoles. Chaque événement a son propre mini-site avec des pages personnalisables pour centraliser toute la communication.',
		},
		{
			number: '02',
			title: "Les bénévoles s'inscrivent",
			description:
				'Ils parcourent les secteurs et choisissent leurs créneaux en autonomie. Chacun gère ses inscriptions, accède à son tableau de bord et reçoit les notifications.',
		},
		{
			number: '03',
			title: 'Tu valides et tu organises',
			description:
				"Notification instantanée, validation ou refus en un clic. Désigne des responsables de secteur pour t'aider. Planning rempli, informations accessibles, zéro stress.",
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
				<div
					class="grid md:grid-cols-2 gap-10 items-center"
					class:md:flex-row-reverse={i % 2 === 1}
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
						{#if i === 0}
							<!-- Étape 1 : Carousel vidéo -->
							<VideoCarousel
								videos={[
									{ src: '/videos/create-event.mp4', title: 'Créer ton événement' },
									{ src: '/videos/edit-theme.mp4', title: 'Personnaliser le thème' },
								]}
							/>
						{:else if i === 1}
							<!-- Étape 2 : Bénévoles qui s'ajoutent -->
							<svg viewBox="0 0 200 160" class="w-48 h-auto relative z-10">
								<g opacity="0.3">
									<circle cx="60" cy="55" r="12" fill="white" />
									<rect x="45" y="72" width="30" height="20" rx="8" fill="white" />
								</g>
								<g opacity="0.5">
									<circle cx="100" cy="55" r="12" fill="white">
										<animate
											attributeName="opacity"
											from="0"
											to="1"
											dur="0.6s"
											begin="0.4s"
											fill="freeze"
										/>
									</circle>
									<rect x="85" y="72" width="30" height="20" rx="8" fill="white">
										<animate
											attributeName="opacity"
											from="0"
											to="1"
											dur="0.6s"
											begin="0.4s"
											fill="freeze"
										/>
									</rect>
								</g>
								<g opacity="0.8">
									<circle cx="140" cy="55" r="12" fill="white">
										<animate
											attributeName="opacity"
											from="0"
											to="1"
											dur="0.6s"
											begin="0.8s"
											fill="freeze"
										/>
									</circle>
									<rect x="125" y="72" width="30" height="20" rx="8" fill="white">
										<animate
											attributeName="opacity"
											from="0"
											to="1"
											dur="0.6s"
											begin="0.8s"
											fill="freeze"
										/>
									</rect>
								</g>
								<path
									d="M50 110 L150 110"
									stroke="white"
									stroke-width="2"
									stroke-dasharray="8 4"
									opacity="0.3"
								/>
								<circle cx="100" cy="110" r="6" fill="white">
									<animate
										attributeName="cy"
										from="130"
										to="110"
										dur="0.8s"
										begin="1.2s"
										fill="freeze"
									/>
								</circle>
							</svg>
						{:else}
							<!-- Étape 3 : Validation -->
							<svg viewBox="0 0 200 160" class="w-48 h-auto relative z-10">
								<circle
									cx="100"
									cy="80"
									r="40"
									fill="none"
									stroke="white"
									stroke-width="3"
									opacity="0.3"
								/>
								<path
									d="M80 80 L92 92 L120 65"
									fill="none"
									stroke="white"
									stroke-width="4"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<animate
										attributeName="stroke-dasharray"
										from="0 100"
										to="100 0"
										dur="0.8s"
										fill="freeze"
									/>
								</path>
								<circle
									cx="100"
									cy="80"
									r="40"
									fill="none"
									stroke="white"
									stroke-width="3"
									opacity="0.6"
								>
									<animate attributeName="r" from="30" to="40" dur="0.6s" fill="freeze" />
								</circle>
							</svg>
						{/if}
					</div>
					{#if i !== 0}
						<p class="text-center text-xs text-base-content/40 mt-3">
							Placeholder visuel — insérer un GIF ici
						</p>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>
