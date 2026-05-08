<script lang="ts">
	const steps = [
		{
			title: 'Tu crées ton événement',
			description: 'Configure les équipes, les shifts et les besoins en bénévoles.',
		},
		{
			title: 'Les bénévoles s\'inscrivent',
			description: 'Ils parcourent les secteurs et choisissent leurs créneaux en autonomie.',
		},
		{
			title: 'Les responsables valident',
			description: 'Notification instantanée, validation ou refus en un clic.',
		},
		{
			title: 'Tout le monde est prêt',
			description: 'Planning rempli, informations accessibles, zéro stress.',
		},
	]
</script>

<section id="workflow" class="py-20 md:py-28">
	<div class="max-w-6xl mx-auto px-4 sm:px-6">
		<div class="mb-16 md:mb-20">
			<h2 class="text-3xl md:text-4xl font-extrabold text-[#0d3b66] tracking-tight">
				Comment ça marche
			</h2>
			<p class="mt-4 text-lg text-base-content/70 max-w-xl">
				Quatre étapes simples pour passer de l'idée à l'organisation sans friction.
			</p>
		</div>

		<div class="relative">
			<!-- Connecting line -->
			<div
				class="hidden md:block absolute top-3 left-0 right-0 h-px bg-[#c7b198]/30"
			/>

			<div class="grid gap-12 md:gap-6 md:grid-cols-4">
				{#each steps as step, i}
					<div class="relative flex flex-col">
						<!-- Number -->
						<div
							class="
								relative z-10 w-6 h-6 rounded-full flex items-center justify-center
								bg-[#0d3b66] text-white text-xs font-bold
							"
						>
							{i + 1}
						</div>

						<div class="mt-6">
							<h3 class="text-lg font-bold text-[#0d3b66]">
								{step.title}
							</h3>
							<p class="mt-2 text-base-content/60 text-sm leading-relaxed max-w-[260px]">
								{step.description}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
