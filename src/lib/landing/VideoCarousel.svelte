<script lang="ts">
	import { tip } from 'fuma'
	import { slide } from 'svelte/transition'
	import { activeVideoIndex, reportVisibility } from './videoStore'

	interface Video {
		src: string
		title: string
	}

	let klass = ''

	export let videos: Video[]
	export { klass as class }
	export let index: number

	let activeIndex = 0
	let isLoading = false
	let videoElement: HTMLVideoElement

	function observeVisibility(node: HTMLVideoElement) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					reportVisibility(index, entry.intersectionRatio)
				})
			},
			{ threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }
		)
		observer.observe(node)
		return {
			destroy() {
				observer.disconnect()
				reportVisibility(index, 0)
			},
		}
	}

	function setActive(index: number) {
		isLoading = true
		activeIndex = index
	}

	function nextActive() {
		if (activeIndex >= videos.length - 1) setActive(0)
		else setActive(activeIndex + 1)
	}

	function handleLoadedData() {
		isLoading = false
		if ($activeVideoIndex === index) {
			videoElement?.play().catch(() => {})
		}
	}

	$: if (videoElement && $activeVideoIndex !== undefined) {
		if ($activeVideoIndex === index) {
			videoElement.play().catch(() => {})
		} else {
			videoElement.pause()
		}
	}
</script>

<div class={klass}>
	<video
		bind:this={videoElement}
		src={videos[activeIndex].src}
		muted
		playsinline
		use:observeVisibility
		on:loadeddata={handleLoadedData}
		on:ended={nextActive}
		class="
			w-full aspect-[1.59] rounded-lg
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
