<script lang="ts">
	import type { Media } from '@prisma/client'
	import { tick } from 'svelte'
	import { tip } from 'fuma'
	import type { RemoteFormField } from '$app/server'
	import { XIcon } from '@lucide/svelte'
	import { mediaDrawer } from './MediaDrawer.svelte'
	import MediaPreview from './MediaPreview.svelte'

	interface Props {
		label: string
		/** Champ du formulaire qui porte l'id du média. */
		field: RemoteFormField<string>
		value?: string | null | undefined
		oninput?: (media: Media | null) => void
	}

	let { label, field, value = $bindable(), oninput }: Props = $props()

	let input: HTMLInputElement | undefined = $state()

	/**
	 * Le champ caché est écrit par du code, et la médiathèque est un tiroir monté ailleurs dans
	 * la page: rien n'émet le moindre évènement de formulaire. C'est à lui d'annoncer sa nouvelle
	 * valeur, sans quoi ni la barre de sauvegarde ni l'état du formulaire distant ne voient
	 * l'image choisie.
	 */
	function select(media: Media | null) {
		value = media?.id ?? null
		oninput?.(media)
		// Le champ ne porte la valeur qu'au rendu suivant: annoncer avant ferait lire l'ancienne.
		void tick().then(() => input?.dispatchEvent(new Event('input', { bubbles: true })))
	}
</script>

<input {...field.as('hidden', value ?? '')} bind:this={input} />

<MediaPreview bind:mediaId={value} {label} onclick={() => mediaDrawer.open(select)}>
	{#snippet action()}
		<button
			type="button"
			onclick={(event) => {
				event.stopPropagation()
				select(null)
			}}
			class="btn btn-xs btn-square btn-ghost text-base-content/70 hover:text-error"
			use:tip={{ content: 'Désélectionner' }}
		>
			<XIcon size={14} />
		</button>
	{/snippet}
</MediaPreview>
