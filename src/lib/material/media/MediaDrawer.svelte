<script lang="ts" module>
	import type { Media } from '@prisma/client'
	import { goto } from '$app/navigation'
	import { urlParam } from 'fuma'

	/** Le paramètre d'URL qui ouvre le tiroir: `Drawer` en fait sa visibilité. */
	const MEDIA_DRAWER_KEY = 'select_media'

	/**
	 * La médiathèque est montée une seule fois, par le layout de l'évènement — un tiroir par
	 * `InputMedia` empilerait autant de formulaires d'envoi que de champs.
	 *
	 * Qui veut une image dépose ici ce qu'il compte en faire; le tiroir l'appelle au choix. Le
	 * contexte du module suffit: il n'y a qu'un tiroir, donc qu'un demandeur à la fois, et
	 * passer par le contexte de composant obligerait chaque appelant à être monté sous lui.
	 */
	let onselect = $state<((media: Media) => void) | undefined>(undefined)

	export const mediaDrawer = {
		/** Ouvre la médiathèque; `handler` reçoit l'image choisie. */
		open(handler: (media: Media) => void) {
			onselect = handler
			return goto(urlParam.with({ [MEDIA_DRAWER_KEY]: 1 }), {
				replaceState: true,
				noScroll: true,
				keepFocus: true,
			})
		},
	}
</script>

<script lang="ts">
	import { PencilIcon, PlusIcon } from '@lucide/svelte'
	import { ButtonDelete, Dialog, Drawer, InputString, tip } from 'fuma'

	import { enhanceForm } from '$lib/enhanceForm'
	import UploadMediaDialog from './UploadMediaDialog.svelte'
	import { deleteMedia, editMedia, searchMedias, uploadMedia } from './media.remote'
	import type { ClassValue } from 'svelte/elements'
	import MediaPreview from './MediaPreview.svelte'

	/** La tuile d'ajout reprend le cadre que `MediaPreview` donne aux médias. */
	const TILE: ClassValue = [
		'border border-hard rounded-field cursor-pointer hover:outline-1 aspect-square',
		'bg-dash',
		'grid place-content-center',
	]

	let drawer: Drawer = $state()!
	let dialogEdit: HTMLDialogElement = $state()!
	let dialogUploadMedia: UploadMediaDialog = $state()!
	let editedMedia: Media | undefined = $state(undefined)

	function handleSelect(media: Media) {
		onselect?.(media)
		drawer.close()
	}
</script>

<Drawer bind:this={drawer} key={MEDIA_DRAWER_KEY} title="Médiathèque" class="surface-drawer">
	<!-- Le tiroir est monté sur toutes les pages de l'évènement, mais ne rend son contenu
	     qu'ouvert: la requête part au premier affichage, pas à chaque chargement de page. -->
	{@const medias = searchMedias('')}
	<div
		class="grid items-start gap-3 pb-6 pt-3"
		style:grid-template-columns="repeat(auto-fill, minmax(min(9rem, 100%), 1fr))"
	>
		{#each medias.current ?? [] as media (media.id)}
			<!-- Le bouton d'édition est frère et non enfant du bouton de sélection: un `<button>`
			     dans un `<button>` est du HTML invalide, que le navigateur réarrange. -->
			<MediaPreview label={media.name} mediaId={media.id} onclick={() => handleSelect(media)}>
				{#snippet action()}
					{#if media.eventId}
						<button
							type="button"
							onclick={() => {
								editedMedia = media
								dialogEdit.showModal()
							}}
							class="btn btn-xs btn-square btn-ghost text-base-content/70"
						>
							<span class="inline-flex" use:tip={{ content: 'Modifier' }}>
								<PencilIcon size={14} />
							</span>
						</button>
					{/if}
				{/snippet}
			</MediaPreview>
		{/each}

		<button
			type="button"
			class={TILE}
			aria-label="Ajouter une nouvelle image"
			onclick={() => dialogUploadMedia.show()}
			use:tip={{ content: 'Ajouter une nouvelle image' }}
		>
			<PlusIcon class="text-base-content/70" size={42} />
		</button>
	</div>

	<!-- Le dialogue est rendu dans le tiroir, et monté d'emblée. Frère du tiroir, il recevrait
	     l'`inert` que celui-ci pose sur son entourage à l'ouverture, et un `<dialog>` ainsi marqué
	     reste mort une fois ouvert: le top layer n'échappe qu'à l'inertie d'un ancêtre, pas à la
	     sienne. Sous un `{#if}`, `bind:dialog` ne donnerait sa référence qu'au rendu suivant, quand
	     le clic qui l'ouvre est déjà passé. -->
	<Dialog bind:dialog={dialogEdit}>
		{#snippet header()}
			<h3 class="title">Édition d'une image</h3>
		{/snippet}

		<!-- `field.as(type, value)` ne fournit qu'une valeur initiale: sans remontage, la description
		     resterait celle de l'image précédemment ouverte. -->
		{#key editedMedia}
			{#if editedMedia}
				<img src="/media/{editedMedia.id}" alt={editedMedia.name} class="mx-auto" />

				<!-- Un seul `<form>` porte les deux remote functions: le `formaction` du bouton pressé
				     décide laquelle s'exécute. -->
				<form
					class="contents"
					{...editMedia.enhance(enhanceForm({ onsuccess: () => dialogEdit.close() }))}
					{...deleteMedia.enhance(enhanceForm({ onsuccess: () => dialogEdit.close() }))}
				>
					<div class="mt-4 flex flex-row-reverse items-end gap-2">
						<input type="hidden" name="id" value={editedMedia.id} />

						<button formaction={editMedia.action} class="btn btn-primary"> Valider </button>
						<ButtonDelete formaction={deleteMedia.action} />

						<InputString
							field={editMedia.fields.name}
							label="Description de l'image"
							class="grow"
							autocomplete="off"
							value={editedMedia.name}
						/>
					</div>
				</form>
			{/if}
		{/key}
	</Dialog>
</Drawer>

<form
	{...uploadMedia.enhance(
		enhanceForm({
			success: 'Nouvelle image',
			onsuccess: () => {
				dialogUploadMedia.close()
				const media = uploadMedia.result
				if (media) handleSelect(media)
			},
		})
	)}
	enctype="multipart/form-data"
>
	<UploadMediaDialog
		bind:this={dialogUploadMedia}
		title="Nouvelle image"
		formaction={uploadMedia.action}
		nameField={uploadMedia.fields.name}
		freeAspect
	/>
</form>
