<script lang="ts">
	import type { Media } from '@prisma/client'
	import { PlaceholderImage } from '$lib/ui'
	import { tip } from 'fuma'
	import { XIcon } from '@lucide/svelte'
	import { slide } from 'svelte/transition'
	import { mediaDrawer } from './MediaDrawer.svelte'

	interface Props {
		label: string
		/** Nom du champ caché portant l'id du média. Vide, le champ ne soumet rien. */
		key?: string | null
		value?: string | null | undefined
		oninput?: (media: Media | null) => void
	}

	let { label, key = null, value = $bindable(), oninput }: Props = $props()
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
		onclick={() =>
			mediaDrawer.open((media) => {
				value = media.id
				oninput?.(media)
			})}
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
			<span class="label text-sm">{label}</span>
			<button
				type="button"
				onclick={(event) => {
					event.stopPropagation()
					value = null
					oninput?.(null)
				}}
				class="btn btn-xs btn-square btn-ghost text-base-content/70 hover:text-error"
				use:tip={{ content: 'Désélectionner' }}
			>
				<XIcon size={14} />
			</button>
		</div>
	{/if}
</div>
