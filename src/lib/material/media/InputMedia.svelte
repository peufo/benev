<script lang="ts">
	import type { Media } from '@prisma/client'
	import { PlaceholderImage } from '$lib/ui'
	import { tip } from 'fuma'
	import { XIcon } from '@lucide/svelte'
	import { SelectMedia } from '$lib/material'
	import { slide } from 'svelte/transition'

	export let key: string | null = null
	export let label: string
	export let value: string | null | undefined = undefined
	export let x = 160
	export let y = 160
	export let oninput: (media: Media | null) => void = () => {}

	let selectMedia: SelectMedia
</script>

{#if key}
	<input type="hidden" name={key} {value} />
{/if}

<div class="flex flex-col space-y-0.5">
	<button
		class={[
			'border border-hard rounded-field cursor-pointer hover:outline-1 aspect-square',
			'bg-dash w-40 h-40',
			'grid place-content-center',
		]}
		onclick={() => {
			selectMedia.show()
		}}
		type="button"
	>
		{#if value}
			<img src="/media/{value}" alt={label} class="w-38 h-38 object-scale-down" />
		{:else}
			<PlaceholderImage>{label}</PlaceholderImage>
		{/if}
	</button>

	{#if value}
		<div class="flex items-center justify-between" transition:slide>
			<span class="label">{label}</span>
			<button
				type="button"
				onclick={(event) => {
					event.stopPropagation()
					value = null
					oninput(null)
				}}
				class="btn btn-xs btn-square btn-ghost text-base-content/70 hover:text-error"
				use:tip={{ content: 'Désélectionner' }}
			>
				<XIcon size={14} />
			</button>
		</div>
	{/if}
</div>

<SelectMedia
	bind:this={selectMedia}
	onselect={(media) => {
		value = media.id
		oninput(media)
	}}
/>
