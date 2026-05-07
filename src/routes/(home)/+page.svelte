<script lang="ts">
	import logo from '$lib/assets/logo.svg'
	import { Features } from '$lib/features'
	import { Testimonials } from '$lib/testimonials'
	import { Workflow, LandingCTA } from '$lib/landing'

	export let data
</script>

<div class="-mx-2 sm:-mx-4">
	<!-- Hero -->
	<section class="relative overflow-hidden">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-32 text-center">
			<!-- Logo -->
			<div class="inline-flex items-center justify-center gap-3 mb-8">
				<img src={logo} alt="Logo benev" class="w-12 h-12" />
				<span class="text-2xl font-bold text-[#0d3b66]">benevio</span>
			</div>

			<!-- Headline -->
			<h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-[#0d3b66] leading-tight">
				Moins d'admin,
				<br />
				plus d'événement
			</h1>

			<!-- Subheadline -->
			<p class="mt-6 text-lg md:text-xl text-base-content/70 max-w-2xl mx-auto leading-relaxed">
				Inscriptions, planning et communication : centralise la gestion de tes bénévoles dans un
				outil simple, transparent et open source.
			</p>

			<!-- CTA Group -->
			<div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
				<a
					href="/me"
					class="
					btn btn-lg btn-primary bg-[#0d3b66] border-[#0d3b66] text-white
					hover:bg-[#092b4d] hover:border-[#092b4d]
					shadow-lg hover:shadow-xl
					transition-all duration-200
					min-w-[220px]
				"
				>
					{data.user ? 'Voir mes événements' : 'Créer mon événement'}
				</a>

				<a
					href="/pricing"
					class="
					btn btn-lg btn-ghost text-[#0d3b66]
					hover:bg-[#0d3b66]/5
					transition-colors duration-200
				"
				>
					Voir les tarifs
				</a>
			</div>

			<!-- Trust mention -->
			<p class="mt-5 text-sm text-base-content/50">
				Gratuit jusqu'à 20 bénévoles · Open source · Sans engagement
			</p>
		</div>
	</section>

	<!-- Workflow -->
	<Workflow />

	<!-- Features -->
	<Features />

	<!-- Testimonials -->
	<Testimonials />

	<!-- Final CTA -->
	<LandingCTA user={data.user} />
</div>
