<script lang="ts">
	import { mdiChevronDown } from '@mdi/js'
	import { CardBasic, Icon } from 'fuma'
	import '$lib/style/animate.css'
	import { features } from '$lib/features'

	export let title = 'Les possibilités'
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
	<div
		class="grid gap-4 items-start overflow-auto mt-14"
		style="grid-template-columns: repeat(auto-fill, minmax(min(20rem, 100%), 1fr)"
	>
		{#each features as feat}
			<CardBasic class="shadow p-5">
				<div class="flex flex-wrap gap-4 items-center">
					<Icon path={feat.icon} size={30} class="opacity-70 p-1 border rounded bg-base-200" />
					<h2 class="font-medium">
						{feat.name}
					</h2>
					<div class="grow" />
				</div>
				<p class="mt-3 opacity-80">
					{feat.description}
				</p>
				{#if feat.comingSoon}
					<span class="badge bg-base-200 mt-3">{feat.comingSoon}</span>
				{/if}
			</CardBasic>
		{/each}
	</div>
</section>
