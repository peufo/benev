<script lang="ts">
	import { Testimonials } from '$lib/testimonials'
	import { Workflow, LandingCTA, AnimatedLogo, PricingSection } from '$lib/landing'

	export let data
</script>

<div class="-mx-2 sm:-mx-4">
	<!-- Hero: asymétrique -->
	<section class="relative overflow-hidden">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
			<div class="grid md:grid-cols-2 gap-12 items-center">
				<!-- Texte -->
				<div class="text-left">
					<h1
						class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-primary leading-[1.1] tracking-tight"
					>
						Moins d'admin pour ton événement
					</h1>

					<p class="mt-6 text-lg md:text-xl text-base-content/70 max-w-lg leading-relaxed">
						Inscriptions, planning et communication : centralise la gestion de tes bénévoles dans un
						outil moderne et accessible.
					</p>

					<div class="mt-8 flex flex-col sm:flex-row items-start gap-4">
						<a
							href="/me"
							class="
								btn btn-lg btn-primary
								shadow-lg hover:shadow-xl
								transition-shadow duration-200
								min-w-[220px]
							"
						>
							{data.user ? 'Voir mes événements' : 'Organiser mon événement'}
						</a>

						<a
							href="#workflow"
							class="
								btn btn-lg btn-ghost text-primary
								hover:bg-primary/5
								transition-colors duration-200
							"
						>
							Comment ça marche
						</a>
					</div>
				</div>

				<!-- Logo animé -->
				<div class="hidden md:flex items-center justify-center relative">
					<div
						class="w-72 h-72 rounded-full bg-gradient-to-br from-brand-beige/40 to-primary/10 blur-2xl absolute"
					/>
					<div class="relative w-64">
						<AnimatedLogo />
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Trust band -->
	<section class="border-y border-brand-beige/20 bg-brand-beige/5">
		<div class="max-w-5xl mx-auto px-4 sm:px-6 py-6">
			<div class="flex flex-col md:flex-row items-center justify-between gap-4">
				<div
					class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-base-content/70"
				>
					<a class="flex items-center gap-2 link link-hover" href="/open-source">
						<span class="w-2 h-2 rounded-full bg-green-500" />
						Open source
					</a>
					<span class="flex items-center gap-2">
						<span class="w-2 h-2 rounded-full bg-brand-beige" />
						Gratuit jusqu'à 50 bénévoles
					</span>
					<span class="flex items-center gap-2">
						<span class="w-2 h-2 rounded-full bg-primary" />
						Personnalisable à ton image
					</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Workflow -->
	<Workflow />

	<!-- Pricing -->
	<PricingSection />

	<!-- Testimonials -->
	<Testimonials />

	<!-- Final CTA -->
	<LandingCTA user={data.user} />
</div>
