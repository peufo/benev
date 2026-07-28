<script lang="ts">
	import { run } from 'svelte/legacy';

	import { tip } from '$lib/fuma'
	import { slide } from 'svelte/transition'
	import { activeVideoIndex, reportVisibility } from './videoStore'

	interface Video {
		src: string
		title: string
	}


	
	interface Props {
		class?: string;
		videos: Video[];
		index: number;
	}

	let { class: klass = '', videos, index }: Props = $props();

	let activeIndex = $state(0)
	let isLoading = $state(false)
	let videoElement: HTMLVideoElement = $state()

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
		if (index === activeIndex) return
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
			videoElement?.play().catch(() => undefined)
		}
	}

	run(() => {
		if (videoElement && $activeVideoIndex !== undefined) {
			if ($activeVideoIndex === index) {
				videoElement.play().catch(() => undefined)
			} else {
				videoElement.pause()
			}
		}
	});
</script>

<div class={klass}>
	<video
		bind:this={videoElement}
		src={videos[activeIndex].src}
		muted
		playsinline
		use:observeVisibility
		onloadeddata={handleLoadedData}
		onended={nextActive}
		class="
			w-full aspect-[1.59] rounded-lg
			{isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity
		"
	></video>

	<div class="flex gap-2 items-center justify-center py-2">
		{#each videos as _, i (i)}
			{@const isActive = i === activeIndex}
			<button
				onclick={() => setActive(i)}
				class="badge badge-lg badge-primary transition-opacity duration-300 {isActive
					? 'opacity-100'
					: 'opacity-40 hover:opacity-70'}"
				aria-label="Voir {videos[i].title}"
				use:tip={{ content: videos[i].title, disable: isActive }}
			>
				{#if isActive}
					<div class="whitespace-nowrap text-center" transition:slide={{ axis: 'x' }}>
						{videos[i].title}
					</div>
				{/if}
			</button>
		{/each}
	</div>
</div>
