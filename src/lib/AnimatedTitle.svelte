<script lang="ts">
	import { mdiChevronDown } from '@mdi/js'
	import { Icon } from 'fuma'
	import '$lib/style/animate.css'

	export let title: string
	const titleLength = title.length
	const ANIMATION_STEP = 35
</script>

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
