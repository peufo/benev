<script lang="ts">
	import { type Snippet } from 'svelte'
	import { PlaceholderImage } from '$lib/ui'
	import { slide } from 'svelte/transition'
	import type { HTMLButtonAttributes } from 'svelte/elements'

	interface Props extends HTMLButtonAttributes {
		label: string
		mediaId?: string | null | undefined
		action?: Snippet
	}

	let { label, mediaId = $bindable(), action, class: klass, ...props }: Props = $props()
</script>

<div class="flex flex-col space-y-0.5">
	<!-- L'image est hors flux: dans le flux, sa hauteur intrinsèque devient la taille minimale
	     automatique du bouton et l'emporte sur `aspect-square`. Positionnée, elle reçoit du cadre
	     une boîte définie, sans laquelle `object-fit` n'a rien à redistribuer. -->
	<button
		class={[
			'relative grid aspect-square',
			'border border-hard rounded-field cursor-pointer hover:outline-1',
			'bg-dash',
			klass,
		]}
		type="button"
		{...props}
	>
		{#if mediaId}
			<img
				src="/media/{mediaId}"
				alt={label}
				class="absolute inset-0 size-full object-scale-down p-1"
			/>
		{:else}
			<PlaceholderImage>{label}</PlaceholderImage>
		{/if}
	</button>

	{#if mediaId}
		<div class="flex items-center justify-between gap-1" transition:slide>
			<span class="label truncate text-sm">{label || '-'}</span>
			{@render action?.()}
		</div>
	{/if}
</div>
