<script lang="ts">
	import { Check, Infinity } from 'lucide-svelte'
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
			<!-- Basique -->
			<div class="card bg-base-100 border border-base-200 shadow-sm flex flex-col">
				<div class="card-body flex flex-col flex-1">
					<div class="flex-1">
						<h3 class="text-xl font-bold text-base-content">Basique</h3>
						<div class="mt-2 flex items-baseline gap-1">
							<span class="text-4xl font-extrabold text-primary tracking-tight">0</span>
							<span class="text-lg text-base-content/60">CHF</span>
						</div>
						<ul class="mt-4 space-y-2 text-base-content/80">
							<li class="flex items-start gap-2">
								<Check class="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
								<span>Jusqu'à 50 bénévoles</span>
							</li>
						</ul>
					</div>
					<a href="/me/events/create?plan=basic" class="btn btn-outline btn-primary mt-6 w-full">
						Commencer
					</a>
				</div>
			</div>

			<!-- Standard -->
			<div class="card bg-base-100 border border-base-200 shadow-sm flex flex-col">
				<div class="card-body flex flex-col flex-1">
					<div class="flex-1">
						<h3 class="text-xl font-bold text-base-content">Standard</h3>
						<div class="mt-2 flex items-baseline gap-1">
							<span class="text-4xl font-extrabold text-primary tracking-tight">99</span>
							<span class="text-lg text-base-content/60">CHF</span>
						</div>
						<ul class="mt-4 space-y-2 text-base-content/80">
							<li class="flex items-start gap-2">
								<Check class="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
								<span>Jusqu'à 200 bénévoles</span>
							</li>
							<li class="flex items-start gap-2">
								<Check class="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
								<span>Support email — réponse en 5 jours ouvrables</span>
							</li>
						</ul>
					</div>
					<a href="/me/events/create?plan=standard" class="btn btn-outline btn-primary mt-6 w-full">
						Choisir Standard
					</a>
				</div>
			</div>

			<!-- Premium -->
			<div class="card bg-base-100 border border-base-200 shadow-sm flex flex-col">
				<div class="card-body flex flex-col flex-1">
					<div class="flex-1">
						<h3 class="text-xl font-bold text-base-content">Premium</h3>
						<div class="mt-2 flex items-baseline gap-1">
							<span class="text-4xl font-extrabold text-primary tracking-tight">249</span>
							<span class="text-lg text-base-content/60">CHF</span>
						</div>
						<ul class="mt-4 space-y-2 text-base-content/80">
							<li class="flex items-start gap-2">
								<Infinity class="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
								<span>
									Bénévoles <span class="font-bold text-primary">illimités</span>
								</span>
							</li>
							<li class="flex items-start gap-2">
								<Check class="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
								<span>Support email 7/7 — réponse en 24h</span>
							</li>
						</ul>
					</div>
					<a
						href="/me/events/create?plan=premium"
						class="btn btn-primary mt-6 w-full shadow-md hover:shadow-lg transition-shadow duration-200"
					>
						Choisir Premium
					</a>
				</div>
			</div>
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
							Tu reçois une alerte à l'avance. Tu as le temps de passer à un plan supérieur sans
							interruption de service.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
