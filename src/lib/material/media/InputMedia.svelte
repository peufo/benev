<script lang="ts">
	import type { Media } from '@prisma/client'
	import { PlaceholderImage, tip } from 'fuma'
	import { Trash2Icon } from 'lucide-svelte'
	import { SelectMedia } from '$lib/material'

	export let key: string | null = null
	export let label: string
	export let value: string | null | undefined = undefined
	export let x = 160
	export let y = 160
	export let oninput: (media: Media | null) => void = () => {}

	let selectMedia: SelectMedia
</script>

<div style="width: {x}px;" class="border rounded-lg">
	{#if key}
		<input type="hidden" name={key} {value} />
	{/if}
	{#if value}
		<button
			on:click={() => {
				selectMedia.show()
			}}
			type="button"
			class="hover:shadow-lg shadow transition-shadow rounded-lg relative"
		>
			<img src="/media/{value}" alt="Fond de badge" width={x} height={y} class="rounded-lg" />
			<span class="text-xs">{label}</span>
			<button
				on:click|stopPropagation={() => {
					value = null
					oninput(null)
				}}
				class="ml-auto absolute right-2 bottom-1.5"
				use:tip={{ content: 'Désélectionner' }}
			>
				<Trash2Icon size={12} opacity={0.8} class="hover:fill-error" />
			</button>
		</button>
	{:else}
		<button
			on:click={() => selectMedia.show()}
			type="button"
			class="hover:shadow-lg shadow transition-shadow rounded-lg"
		>
			<PlaceholderImage {x} {y}>{label}</PlaceholderImage>
		</button>
	{/if}
</div>

<SelectMedia
	bind:this={selectMedia}
	on:select={({ detail: media }) => {
		value = media.id
		oninput(media)
	}}
/>
