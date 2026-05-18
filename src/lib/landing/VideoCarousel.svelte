<script lang="ts">
	import { isActive } from '@tiptap/core'
	import { tip } from 'fuma'
	import { slide } from 'svelte/transition'

	interface Video {
		src: string
		title: string
	}

	let klass = ''

	export let videos: Video[]
	export { klass as class }

	let activeIndex = 0
	let isLoading = false

	function setActive(index: number) {
		isLoading = true
		activeIndex = index
	}

	function nextActive() {
		if (activeIndex >= videos.length - 1) setActive(0)
		else setActive(activeIndex + 1)
	}
</script>

<div class={klass}>
	<video
		src={videos[activeIndex].src}
		autoplay
		muted
		playsinline
		on:ended={nextActive}
		on:play={() => (isLoading = false)}
		class="
			aspect-[1.59] rounded-lg
			{isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity
		"
	/>

	<div class="flex gap-2 items-center justify-center py-2">
		{#each videos as _, i}
			{@const isActive = i === activeIndex}
			<button
				transition:slide={{ axis: 'x' }}
				on:click={() => setActive(i)}
				class="badge badge-primary {isActive ? '' : 'w-5 badge-outline hover:bg-primary/10'}"
				aria-label="Voir {videos[i].title}"
				use:tip={{ content: videos[i].title, disable: isActive }}
			>
				{#if isActive}
					<span>{videos[i].title}</span>
				{/if}
			</button>
		{/each}
	</div>
</div>
