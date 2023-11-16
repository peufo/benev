<script lang="ts">
	import { InputImage, ImagePlaceholder } from '$lib/material'
	import type { Crop } from '$lib/material/input/InputImage.svelte'
	import { tick } from 'svelte'

	export let src = ''
	export let alt = ''
	let klass = ''
	export { klass as class }
	export let title = 'Image'
	export let x: number
	export let y: number
	export let aspect = x / y

	let crop: Crop | null = null
	let image = ''
	let scale = 0
	let preview: HTMLImageElement

	async function handleSubmit(detail: { crop: Crop; image: string }) {
		crop = detail.crop
		image = detail.image
		scale = x / crop.width
	}
</script>

<InputImage {title} {aspect} on:submit={({ detail }) => handleSubmit(detail)}>
	{#if crop && image}
		<div
			class="relative overflow-hidden border rounded-lg"
			style:width="{x}px"
			style:height="{y}px"
		>
			<img
				src={image}
				alt="preview"
				bind:this={preview}
				class="absolute max-w-none"
				style:margin="-{scale * crop.y}px 0 0 -{scale * crop.x}px"
				style:width="{scale * preview?.naturalWidth}px"
				style:height="{scale * preview?.naturalHeight}px"
			/>
		</div>
	{:else if src}
		<img {src} {alt} class={klass} width={x} height={y} />
	{:else}
		<ImagePlaceholder {x} {y}>{title}</ImagePlaceholder>
	{/if}
</InputImage>
