<script lang="ts">
	import { resolve } from '$app/paths'
	import { page } from '$app/stores'
	import { JsonLd } from 'svelte-meta-tags'
	import { Testimonials } from '$lib/testimonials'
	import { Workflow, LandingCTA, AnimatedLogo, PricingSection } from '$lib/landing'
	import { softwareApplicationSchema } from '$lib/seo'

	let { data } = $props()
</script>

<!-- Le produit n'est décrit que sur l'accueil : le layout racine couvre aussi les évènements -->
<JsonLd schema={softwareApplicationSchema($page.url.origin)} />

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
						Tes bénévoles s'inscrivent tout seuls
					</h1>

					<p class="mt-6 text-lg md:text-xl text-base-content/70 max-w-lg leading-relaxed">
						Tu poses les secteurs et les créneaux, ils choisissent leur poste. Simple et précis.
					</p>

					<div class="mt-8 flex flex-col sm:flex-row items-start gap-4">
						<a
							href={resolve('/me')}
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

				<!-- Marque animée. Absente en mobile: le header porte déjà le mot-marque, et la
				     colonne repousserait les CTA sous la ligne de flottaison. -->
				<div class="hidden md:flex items-center justify-center relative">
					<div
						class="w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-linear-to-br from-secondary/30 to-primary/10 blur-3xl absolute"
					></div>
					<AnimatedLogo class="relative w-80 lg:w-96" />
				</div>
			</div>
		</div>
	</section>

	<!-- Trust band -->
	<section class="border-y border-secondary/20 bg-secondary/5">
		<div class="max-w-5xl mx-auto px-4 sm:px-6 py-6">
			<div class="flex flex-col md:flex-row items-center justify-between gap-4">
				<div
					class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-base-content/70"
				>
					<!-- Pastilles toutes secondary: les trois affirmations sont indépendantes,
					     pas des catégories — trois teintes inventeraient une taxonomie. -->
					<a class="flex items-center gap-2 link link-hover" href={resolve('/open-source')}>
						<span class="w-2 h-2 rounded-full bg-secondary"></span>
						Open source
					</a>
					<span class="flex items-center gap-2">
						<span class="w-2 h-2 rounded-full bg-secondary"></span>
						Gratuit jusqu'à 50 bénévoles
					</span>
					<span class="flex items-center gap-2">
						<span class="w-2 h-2 rounded-full bg-secondary"></span>
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
