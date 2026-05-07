<script lang="ts">
	export let user: { email?: string } | null = null
</script>

<section class="py-20 md:py-28 bg-[#0d3b66]">
	<div class="max-w-3xl mx-auto px-4 sm:px-6 text-center">
		<h2 class="text-3xl md:text-4xl font-bold text-white">
			Prêt à simplifier ta prochaine édition ?
		</h2>

		<p class="mt-4 text-lg text-white/80 max-w-xl mx-auto">
			Rejoins les organisateurs qui consacrent moins de temps à l'administration et plus à leur événement.
		</p>

		<div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
			<a
				href="/me"
				class="
					btn btn-lg bg-[#c7b198] border-[#c7b198] text-[#0d3b66]
					hover:bg-[#b8a58a] hover:border-[#b8a58a]
					shadow-lg hover:shadow-xl
					transition-all duration-200
				"
			>
				{user ? 'Voir mes événements' : 'Essayer Benev gratuitement'}
			</a>

			<a
				href="/pricing"
				class="
					btn btn-lg btn-ghost text-white
					hover:bg-white/10
					transition-colors duration-200
				"
			>
				Voir les tarifs
			</a>
		</div>

		<p class="mt-6 text-sm text-white/50">
			Gratuit jusqu'à 20 bénévoles. Pas de carte de crédit requise.
		</p>
	</div>
</section>
