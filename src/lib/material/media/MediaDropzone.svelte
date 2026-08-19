<script lang="ts">
	import { UploadIcon } from '@lucide/svelte'

	interface Props {
		/** Un fichier est en vol au-dessus du tiroir: le lâcher tombera ici. */
		active?: boolean
		/**
		 * `hero`: médiathèque vide. La zone prend toute la place et porte l'état vide — un
		 * `Placeholder` gris par-dessus ferait deux boîtes pour un seul message.
		 */
		variant?: 'band' | 'hero'
		onclick: () => void
	}

	let { active = false, variant = 'band', onclick }: Props = $props()
</script>

<!-- `type="button"`: la zone vit dans le formulaire d'envoi, qu'un bouton sans type soumettrait. -->
<button
	type="button"
	{onclick}
	class={[
		'flex w-full items-center justify-center',
		'rounded-box border-2 border-dashed cursor-pointer transition-colors',
		variant === 'hero' ? 'grow flex-col gap-2 p-6' : 'gap-3 py-6',
		active
			? 'border-primary bg-primary/5 text-primary'
			: 'border-hard bg-base-100 text-base-content/70 hover:bg-base-200',
	]}
>
	{#if variant === 'hero'}
		<UploadIcon size={40} class="opacity-70" />
		<p class="text-lg font-semibold">Aucune image dans la médiathèque</p>
		<p class="text-sm">Déposez une image ici, ou cliquez pour parcourir</p>
	{:else}
		<UploadIcon size={20} />
		<span class="text-sm font-medium">Déposez une image ici, ou cliquez pour parcourir</span>
	{/if}
</button>
