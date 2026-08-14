<script lang="ts">
	import { InputImage, type Crop } from '$lib/ui'
	import { PlaceholderImage } from '$lib/ui/placeholder/index.js'

	interface Props {
		key?: string
		src?: string
		alt?: string
		class?: string
		title?: string
		x: number
		y: number
		aspect?: number
	}

	let {
		key = '',
		src = '',
		alt = '',
		class: klass = '',
		title = 'Image',
		x,
		y,
		aspect = x / y,
	}: Props = $props()

	let crop: Crop | null = $state(null)
	let image = $state('')
	let scale = $state(0)
	let preview: HTMLImageElement = $state()!

	async function handleSubmit(detail: { crop: Crop; image: string }) {
		crop = detail.crop
		image = detail.image
		scale = x / crop.width
	}
</script>

<InputImage {key} {title} {aspect} onsubmit={(detail) => handleSubmit(detail)}>
	{#if crop && image}
		<div
			class="relative overflow-hidden rounded-lg border"
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
		<div class="group relative">
			<span
				class="
				absolute inset-px grid
				place-content-center rounded-lg bg-base-300/30
				font-medium opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100
			"
			>
				{title}
			</span>
			<img class="{klass} rounded-lg border" {src} {alt} width={x} height={y} />
		</div>
	{:else}
		<PlaceholderImage>{title}</PlaceholderImage>
	{/if}
</InputImage>
