<script lang="ts">
	export let user: { email?: string } | null = null
</script>

<section class="py-20 md:py-28 bg-primary">
	<div class="max-w-4xl mx-auto px-4 sm:px-6">
		<div class="grid md:grid-cols-2 gap-10 items-center">
			<div>
				<h2 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
					Prêt à simplifier ta prochaine édition ?
				</h2>
				<p class="mt-4 text-lg text-white/70 leading-relaxed">
					Rejoins les organisateurs qui consacrent moins de temps à l'administration et plus à leur
					événement.
				</p>
			</div>

			<div class="flex flex-col items-center gap-4">
				<a
					href="/me"
					class="
						btn btn-lg bg-brand-beige border-brand-beige text-primary
						hover:bg-brand-beige-dark hover:border-brand-beige-dark
						shadow-lg hover:shadow-xl
						transition-shadow duration-200
					"
				>
					{user ? 'Voir mes événements' : 'Essayer Benevio'}
				</a>

				<a
					href="/support"
					class="
						btn btn-lg btn-ghost text-white
						hover:bg-white/10
						transition-colors duration-200
					"
				>
					Soutenir le projet
				</a>
			</div>
		</div>
	</div>
</section>
