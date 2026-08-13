<script lang="ts">
	import { PencilIcon, PlusIcon } from '@lucide/svelte'
	import type { Media } from '@prisma/client'
	import { portal } from 'svelte-portal'
	import { ButtonDelete, Dialog, InputString, tip } from 'fuma'

	import UploadMediaDialog from './UploadMediaDialog.svelte'
	import { tick } from 'svelte'
	import { api } from '$lib/api'
	import { enhanceForm } from '$lib/enhanceForm'
	import { deleteMedia, editMedia, uploadMedia } from './media.remote'

	// TODO: Chelous de récupérer medias en global:
	let medias: Media[] = $state([])
	let dialogMedias: HTMLDialogElement = $state()!
	let dialogEdit: HTMLDialogElement = $state()!
	let dialogUploadMedia: UploadMediaDialog = $state()!

	interface Props {
		/** Remplace l'évènement `select` de la version Svelte 4. */
		onselect?: (media: Media) => void
	}

	let { onselect }: Props = $props()
	let selectedMedia: Media | undefined = $state(undefined)

	async function loadMedias() {
		medias = await $api.media.search('')
	}

	export function show() {
		dialogMedias.showModal()
		loadMedias()
	}

	function handleAddMedia() {
		dialogMedias.close()
		dialogUploadMedia.show()
	}

	function handleSelectMedia(media: Media) {
		dialogMedias.close()
		onselect?.(media)
	}

	async function handleEditMedia(media: Media) {
		selectedMedia = media
		await tick()
		dialogMedias.close()
		dialogEdit.showModal()
	}
</script>

<Dialog bind:dialog={dialogMedias}>
	{#snippet header()}
		<h3 class="title">Médiatèque</h3>
	{/snippet}
	<div>
		<div
			class="grid gap-3 items-start"
			style:grid-template-columns="repeat(auto-fill, minmax(min(8rem, 100%), 1fr))"
		>
			{#each medias as media (media.id)}
				<!--
					Le bouton d'édition est frère et non enfant du bouton de sélection: un
					`<button>` dans un `<button>` est du HTML invalide, que le navigateur
					réarrange à l'hydratation.
				-->
				<div class="relative">
					<button
						type="button"
						onclick={() => handleSelectMedia(media)}
						class="border-soft flex w-full flex-col gap-1 rounded-lg border p-1 text-left outline-1 outline-primary/50 hover:outline"
					>
						<!-- Les médias n'ont pas tous le même ratio: sans cadrage, la grille devient
						     irrégulière et les libellés ne s'alignent plus d'une tuile à l'autre. -->
						<img
							src="/media/{media.id}?size=small"
							alt={media.name}
							class="aspect-square w-full rounded bg-base-200 object-cover"
						/>

						<span
							class="line-clamp-2 min-h-8 text-xs font-medium text-base-content/70"
							class:pr-7={media.eventId}
						>
							{media.name || '-'}
						</span>
					</button>

					{#if media.eventId}
						<button
							type="button"
							onclick={() => handleEditMedia(media)}
							class="btn btn-xs btn-square btn-ghost absolute bottom-1 right-1"
						>
							<span class="inline-flex" use:tip={{ content: 'Modifier' }}
								><PencilIcon size={14} class="text-base-content/70" /></span
							>
						</button>
					{/if}
				</div>
			{/each}

			<button
				type="button"
				class="border-soft grid aspect-square place-content-center rounded-lg border outline-1 outline-primary/50 hover:outline"
				onclick={handleAddMedia}
				use:tip={{ content: 'Ajouter une nouvelle image' }}
			>
				<PlusIcon class="text-base-content/70" size={42} />
			</button>
		</div>
		<!-- <progress transition:slide class="progress my-0" />
		{#if isLoading}
			<progress transition:slide class="progress" />
		{/if} -->
	</div>
</Dialog>

<div class="contents" use:portal={'body'}>
	<form
		{...uploadMedia.enhance(
			enhanceForm({
				success: 'Nouvelle image',
				onsuccess: () => {
					dialogUploadMedia.close()
					const media = uploadMedia.result
					if (!media) return
					medias = [...medias, media]
					onselect?.(media)
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

	{#if selectedMedia}
		<Dialog bind:dialog={dialogEdit}>
			{#snippet header()}
				<h3 class="title">Edition d'une image</h3>
			{/snippet}

			<img src="/media/{selectedMedia.id}" alt={selectedMedia.name} class="mx-auto" />

			<!-- Un seul `<form>` porte les deux remote functions: le `formaction` du bouton
			     pressé décide laquelle s'exécute. -->
			<form
				class="contents"
				{...editMedia.enhance(
					enhanceForm({
						onsuccess: () => {
							dialogEdit.close()
							const media = editMedia.result
							if (media) medias = medias.map((m) => (m.id === media.id ? media : m))
							dialogMedias.showModal()
						},
					})
				)}
				{...deleteMedia.enhance(
					enhanceForm({
						onsuccess: () => {
							dialogEdit.close()
							const media = deleteMedia.result
							if (media) medias = medias.filter((m) => m.id !== media.id)
							dialogMedias.showModal()
						},
					})
				)}
			>
				<div class="flex flex-row-reverse items-end gap-2 mt-4">
					<input type="hidden" name="id" value={selectedMedia.id} />

					<button formaction={editMedia.action} class="btn btn-primary"> Valider </button>
					<ButtonDelete formaction={deleteMedia.action} />

					<InputString
						field={editMedia.fields.name}
						label="Description de l'image"
						class="grow"
						autocomplete="off"
						value={selectedMedia.name}
					/>
				</div>
			</form>
		</Dialog>
	{/if}
</div>
