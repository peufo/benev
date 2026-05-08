<script lang="ts">
	import { mdiOpenInNew } from '@mdi/js'
	import { Icon } from 'fuma'
	import { testimonials } from './testimonials'
</script>

<section class="py-20 md:py-28">
	<div class="max-w-5xl mx-auto px-4 sm:px-6">
		<div class="mb-16 md:mb-20">
			<h2 class="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
				Ils l'utilisent
			</h2>
			<p class="mt-4 text-lg text-base-content/70">
				Pas de marketing, juste des retours de terrain.
			</p>
		</div>

		<div class="grid gap-8 md:grid-cols-2">
			{#each testimonials as t}
				<blockquote class="flex flex-col gap-6">
					<p class="text-xl md:text-2xl text-primary font-medium leading-relaxed">
						&ldquo;{t.quote}&rdquo;
					</p>

					<footer class="flex items-center gap-4">
						<img
							src={t.image}
							alt="Photo de {t.name}"
							class="w-12 h-12 rounded-full object-cover"
						/>
						<div>
							<cite class="not-italic font-bold text-base-content/90">{t.name}</cite>
							<p class="text-sm text-base-content/60">
								{t.role}, {t.eventName}
							</p>
							<a
								href={t.eventUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-1 text-sm text-primary hover:underline"
							>
								<span>{t.volunteersCount}</span>
								<Icon path={mdiOpenInNew} size={12} class="opacity-60" />
							</a>
						</div>
					</footer>
				</blockquote>
			{/each}
		</div>
	</div>
</section>
