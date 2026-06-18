<script lang="ts">
	const benefits = [
		{
			number: '01',
			title: 'Ton événement, ton site',
			description:
				'Crée un espace dédié avec des pages personnalisables pour centraliser toute la communication. Chaque événement a son propre mini-site, accessible aux bénévoles sans création de compte compliquée.',
			color: 'bg-primary',
		},
		{
			number: '02',
			title: "Gestion d'équipe collaborative",
			description:
				"Désigne des administrateurs et des responsables de secteur pour t'aider dans l'organisation. Chacun a les droits adaptés à son rôle, sans accès superflu.",
			color: 'bg-brand-beige',
		},
		{
			number: '03',
			title: 'Bénévoles autonomes',
			description:
				"Chaque bénévole gère ses inscriptions, accède à son tableau de bord et reçoit les notifications. Moins de questions en privé, plus d'autonomie sur le terrain.",
			color: 'bg-primary',
		},
	]
</script>

<section class="py-20 md:py-28 bg-brand-beige/10">
	<div class="max-w-6xl mx-auto px-4 sm:px-6">
		<div class="mb-16 md:mb-20">
			<h2 class="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
				Ce que Benev fait pour toi
			</h2>
			<p class="mt-4 text-lg text-base-content/70 max-w-xl">
				Pas une liste interminable de fonctionnalités. Juste l'essentiel, bien fait.
			</p>
		</div>

		<div class="flex flex-col gap-20 md:gap-28">
			{#each benefits as benefit, i}
				<div
					class="grid md:grid-cols-2 gap-10 items-center"
					class:md:flex-row-reverse={i % 2 === 1}
				>
					<!-- Texte -->
					<div class={i % 2 === 1 ? 'md:order-2' : ''}>
						<span
							class="text-7xl md:text-8xl font-extrabold text-primary/10 leading-none select-none"
						>
							{benefit.number}
						</span>
						<h3 class="text-2xl md:text-3xl font-bold text-primary mt-2 tracking-tight">
							{benefit.title}
						</h3>
						<p class="mt-4 text-base-content/70 leading-relaxed text-lg max-w-md">
							{benefit.description}
						</p>
					</div>

					<!-- Visuel abstrait -->
					<div class={i % 2 === 1 ? 'md:order-1' : ''}>
						<div
							class="{benefit.color} rounded-3xl aspect-[4/3] flex items-center justify-center relative overflow-hidden"
						>
							<div
								class="absolute inset-0 opacity-20"
								style="background: repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)"
							/>
							<span class="text-6xl font-extrabold text-white/90 relative z-10">
								{benefit.number}
							</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
