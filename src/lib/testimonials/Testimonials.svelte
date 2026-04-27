<script lang="ts">
	import { mdiChevronDown, mdiOpenInNew } from '@mdi/js'
	import { CardBasic, Icon } from 'fuma'
	import '$lib/style/animate.css'
	import { testimonials } from './testimonials'

	export let title = 'Ils nous font confiance'
	const titleLength = title.length
	const ANIMATION_STEP = 35
</script>

<section class="mt-8 mb-10 max-w-7xl mx-auto">
	<div class="flex justify-center gap-4">
		<Icon
			path={mdiChevronDown}
			size={30}
			class="opacity-60 animate__pulse"
			style="
				--animate-rotate: {(titleLength / 2) * -2}deg;
			"
		/>
		<h2 class="title text-2xl">
			{#each title.split('') as char, index}
				<span
					class="inline-block animate__pulse"
					class:mr-2={char === ' '}
					style="
						--animate-delay: {ANIMATION_STEP * (index + 1)}ms;
						--animate-rotate: {(titleLength / 2 - index) * -2}deg;
					"
				>
					{char}
				</span>
			{/each}
		</h2>
		<Icon
			path={mdiChevronDown}
			size={30}
			class="opacity-60 animate__pulse"
			style="
				--animate-delay: {(titleLength + 2) * ANIMATION_STEP}ms;
				--animate-rotate: {(titleLength / 2) * 2}deg;
			"
		/>
	</div>

	<div class="grid gap-6 mt-14 md:grid-cols-2">
		{#each testimonials as t}
			<CardBasic class="shadow p-6 relative overflow-hidden">
				<div class="flex flex-col gap-5">
					<div class="flex items-center gap-4">
						<img
							src={t.image}
							alt="Photo de {t.name}"
							class="w-20 h-20 rounded-full object-cover border-2 border-primary/20 shadow-sm"
						/>
						<div>
							<p class="font-semibold text-lg text-base-content/90">{t.name}</p>
							<p class="text-sm text-base-content/60">{t.role}</p>
							<a
								href={t.eventUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
							>
								{t.eventName}
								<Icon path={mdiOpenInNew} size={14} class="opacity-70" />
							</a>
							<span class="text-xs text-base-content/50 ml-1">({t.volunteersCount})</span>
						</div>
					</div>

					<blockquote class="relative">
						<span class="absolute -top-2 -left-1 text-4xl text-primary/10 font-serif leading-none">
							&ldquo;
						</span>
						<p class="italic text-base-content/80 leading-relaxed pl-5">
							{t.quote}
						</p>
					</blockquote>
				</div>
			</CardBasic>
		{/each}
	</div>
</section>
