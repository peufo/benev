<script lang="ts">
	import { mdiCalendarPlus, mdiAccountCheck, mdiShieldCheck, mdiPartyPopper } from '@mdi/js'
	import { Icon } from 'fuma'

	const steps = [
		{
			icon: mdiCalendarPlus,
			title: 'Tu crées ton événement',
			description: 'Configure les équipes, les shifts et les besoins en bénévoles.',
		},
		{
			icon: mdiAccountCheck,
			title: 'Les bénévoles s\'inscrivent',
			description: 'Ils parcourent les secteurs et choisissent leurs créneaux en autonomie.',
		},
		{
			icon: mdiShieldCheck,
			title: 'Les responsables valident',
			description: 'Notification instantanée, validation ou refus en un clic.',
		},
		{
			icon: mdiPartyPopper,
			title: 'Tout le monde est prêt',
			description: 'Planning rempli, informations accessibles, zéro stress.',
		},
	]
</script>

<section class="py-20 md:py-28">
	<div class="max-w-6xl mx-auto px-4 sm:px-6">
		<div class="text-center mb-16 md:mb-20">
			<h2 class="text-3xl md:text-4xl font-bold text-[#0d3b66]">
				Comment ça marche
			</h2>
			<p class="mt-4 text-lg text-base-content/70 max-w-xl mx-auto">
				Quatre étapes simples pour passer de l'idée à l'organisation sans friction.
			</p>
		</div>

		<div class="relative">
			<!-- Connecting line (desktop) -->
			<div
				class="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-[#c7b198]/30"
			/>

			<div class="grid gap-8 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
				{#each steps as step, i}
					<div class="relative flex flex-col items-center text-center">
						<!-- Numbered circle -->
						<div
							class="
								relative z-10 w-14 h-14 rounded-full flex items-center justify-center
								bg-[#0d3b66] shadow-lg
							"
						>
							<Icon path={step.icon} size={28} class="[&_path]:fill-white" />
						</div>

						<!-- Step number -->
						<span
							class="mt-4 text-sm font-bold tracking-widest uppercase text-[#c7b198]"
						>
							Étape {i + 1}
						</span>

						<!-- Title -->
						<h3 class="mt-2 text-lg font-semibold text-[#0d3b66]">
							{step.title}
						</h3>

						<!-- Description -->
						<p class="mt-2 text-base-content/70 text-sm leading-relaxed max-w-[260px]">
							{step.description}
						</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
