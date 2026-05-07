<script lang="ts">
	import { mdiOpenInNew } from '@mdi/js'
	import { Icon } from 'fuma'
	import { testimonials } from './testimonials'
</script>

<section class="py-20 md:py-28">
	<div class="max-w-5xl mx-auto px-4 sm:px-6">
		<div class="text-center mb-16 md:mb-20">
			<h2 class="text-3xl md:text-4xl font-bold text-[#0d3b66]">
				Ils nous font confiance
			</h2>
			<p class="mt-4 text-lg text-base-content/70">
				Des organisateurs qui ont simplifié leur gestion bénévole.
			</p>
		</div>

		<div class="grid gap-8 md:grid-cols-2">
			{#each testimonials as t}
				<blockquote
					class="
						relative p-8 rounded-2xl
						bg-base-100 border border-base-200/60
						hover:shadow-lg hover:border-[#c7b198]/30
						transition-shadow duration-300
					"
				>
					<!-- Quote mark -->
					<span class="absolute top-6 left-6 text-6xl text-[#c7b198]/20 font-serif leading-none">
						&ldquo;
					</span>

					<div class="relative">
						<p class="text-base-content/80 leading-relaxed text-base italic pl-4">
							{t.quote}
						</p>

						<footer class="mt-6 flex items-center gap-4">
							<img
								src={t.image}
								alt="Photo de {t.name}"
								class="w-14 h-14 rounded-full object-cover border-2 border-[#c7b198]/30"
							/>
							<div>
								<cite class="not-italic font-semibold text-base-content/90">
									{t.name}
								</cite>
								<p class="text-sm text-base-content/60">
									{t.role}, {t.eventName}
								</p>
								<a
									href={t.eventUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-1 text-sm text-[#0d3b66] hover:underline mt-0.5"
								>
									<span>{t.volunteersCount}</span>
									<Icon path={mdiOpenInNew} size={12} class="opacity-60" />
								</a>
							</div>
						</footer>
					</div>
				</blockquote>
			{/each}
		</div>
	</div>
</section>
