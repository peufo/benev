<script lang="ts">
	import { TierCard } from '$lib/event'
</script>

<section class="py-20 md:py-28" id="pricing">
	<div class="max-w-6xl mx-auto px-4 sm:px-6">
		<!-- Header -->
		<div class="mb-16 md:mb-20">
			<h2 class="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
				Des tarifs simples et transparents
			</h2>
			<p class="mt-4 text-lg text-base-content/70 max-w-xl">
				Commence gratuitement. Passe à un plan supérieur quand tu veux.
			</p>
		</div>

		<!-- Pricing grid -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<TierCard
				tier="basic"
				action={{ label: 'Commencer', href: '/me/events/create?plan=basic' }}
			/>
			<TierCard
				tier="standard"
				features={['Support email — réponse en 5 jours ouvrables']}
				action={{ label: 'Choisir Standard', href: '/me/events/create?plan=standard' }}
			/>
			<TierCard
				tier="premium"
				features={['Support email 7/7 — réponse en 24h']}
				action={{ label: 'Choisir Premium', href: '/me/events/create?plan=premium' }}
			/>
		</div>

		<!-- Pro: horizontal, subdued -->
		<div class="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div class="card-body flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h3 class="text-xl font-bold text-base-content">Pro</h3>
					<p class="text-base-content/70 mt-1">Tarif sur mesure — ligne directe avec l'équipe</p>
				</div>
				<a href="/contact" class="btn btn-outline btn-primary whitespace-nowrap">
					Nous contacter
				</a>
			</div>
		</div>

		<!-- FAQ -->
		<div class="mt-16 md:mt-20 max-w-3xl">
			<h3 class="text-2xl md:text-3xl font-bold text-primary tracking-tight mb-6">
				Questions fréquentes
			</h3>
			<div class="space-y-3">
				<div class="collapse collapse-arrow bg-base-100 border border-base-200">
					<input type="checkbox" aria-label="Afficher la réponse" />
					<div class="collapse-title text-lg font-medium pr-12">
						Faut-il anticiper le nombre de bénévoles ?
					</div>
					<div class="collapse-content">
						<p class="text-base-content/80 leading-relaxed">
							Non. Tu peux changer de plan à tout moment selon tes besoins. Commence avec l'offre
							gratuite et passe à un plan supérieur quand ton événement grandit.
						</p>
					</div>
				</div>

				<div class="collapse collapse-arrow bg-base-100 border border-base-200">
					<input type="checkbox" aria-label="Afficher la réponse" />
					<div class="collapse-title text-lg font-medium pr-12">
						Que se passe-t-il en cas de dépassement ?
					</div>
					<div class="collapse-content">
						<p class="text-base-content/80 leading-relaxed">
							Les bénévoles peuvent continuer à s'inscrire, mais l'accès à l'espace administrateur
							est restreint. Passe à un plan supérieur pour retrouver toutes les fonctionnalités.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
