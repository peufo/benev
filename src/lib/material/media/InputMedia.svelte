<script lang="ts">
	import type { Media } from '@prisma/client'
	import { PlaceholderImage } from '$lib/ui'
	import { tip } from 'fuma'
	import { Trash2Icon } from '@lucide/svelte'
	import { SelectMedia } from '$lib/material'

	export let key: string | null = null
	export let label: string
	export let value: string | null | undefined = undefined
	export let x = 160
	export let y = 160
	export let oninput: (media: Media | null) => void = () => {}

	let selectMedia: SelectMedia
</script>

<div
	style="width: {x}px;"
	class="border border-hard rounded-field overflow-hidden cursor-pointer hover:outline-1"
>
	{#if key}
		<input type="hidden" name={key} {value} />
	{/if}
	{#if value}
		<!-- Le bouton « désélectionner » était imbriqué dans le bouton de sélection: HTML
		     invalide, que Svelte 5 refuse désormais de compiler. Les deux sont maintenant
		     frères dans un conteneur positionné. -->
		<div>
			<button
				onclick={() => {
					selectMedia.show()
				}}
				type="button"
			>
				<img src="/media/{value}" alt="Fond de badge" width={x} height={y} />
				<span class="text-xs">{label}</span>
			</button>
			<button
				type="button"
				onclick={(event) => {
					event.stopPropagation()
					value = null
					oninput(null)
				}}
				class="ml-auto absolute right-2 bottom-1.5"
				use:tip={{ content: 'Désélectionner' }}
			>
				<Trash2Icon size={12} opacity={0.8} class="hover:text-error" />
			</button>
		</div>
	{:else}
		<button onclick={() => selectMedia.show()} type="button">
			<PlaceholderImage {x} {y}>{label}</PlaceholderImage>
		</button>
	{/if}
</div>

<SelectMedia
	bind:this={selectMedia}
	onselect={(media) => {
		value = media.id
		oninput(media)
	}}
/>
