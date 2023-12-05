<script lang="ts">
	import { InputImage, ImagePlaceholder } from '$lib/material'
	import type { Crop } from '$lib/material/input/InputImage.svelte'

	export let key = ''
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

<InputImage {key} {title} {aspect} on:submit={({ detail }) => handleSubmit(detail)}>
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
		<div class="relative group">
			<span
				class="
				font-medium bg-base-300/30 backdrop-blur-sm
				transition-opacity opacity-0 group-hover:opacity-100
				absolute inset-[1px] grid place-content-center rounded-lg
			"
			>
				{title}
			</span>
			<img class="{klass} border rounded-lg" {src} {alt} width={x} height={y} />
		</div>
	{:else}
		<ImagePlaceholder {x} {y}>{title}</ImagePlaceholder>
	{/if}
</InputImage>
