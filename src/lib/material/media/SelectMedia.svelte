<script lang="ts">
	import { PencilIcon, PlusIcon } from '@lucide/svelte'
	import type { Media } from '@prisma/client'
	import { portal } from 'svelte-portal'
	import { ButtonDelete, Dialog, InputString, tip } from 'fuma'
	import { toast } from 'svelte-sonner'

	import UploadMediaDialog from './UploadMediaDialog.svelte'
	import { tick } from 'svelte'
	import { api } from '$lib/api'
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
		dialogMedias.show()
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
			style:grid-template-columns="repeat(auto-fill, minmax(min(6rem, 100%), 1fr)"
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
						class="w-full text-left border rounded-lg outline-primary/50 outline-1 hover:outline p-1 flex flex-col gap-1"
					>
						<img src="/media/{media.id}?size=small" alt={media.name} class="rounded" />

						<div class="flex items-center w-full flex-wrap gap-2" class:pr-7={media.eventId}>
							<span class="title-sm h-6">{media.name || '-'}</span>
						</div>
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
				class="border rounded-lg grid place-content-center aspect-square outline-primary/50 outline-1 hover:outline"
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
		{...uploadMedia.enhance(async ({ submit }) => {
			await submit()
			const media = uploadMedia.result
			dialogUploadMedia.close()
			if (!media) return
			toast.success('Nouvelle image')
			medias = [...medias, media]
			onselect?.(media)
		})}
		enctype="multipart/form-data"
	>
		<UploadMediaDialog
			bind:this={dialogUploadMedia}
			title="Nouvelle image"
			formaction={uploadMedia.action}
			freeName
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
				{...editMedia.enhance(async ({ submit }) => {
					await submit()
					dialogEdit.close()
					const media = editMedia.result
					if (media) medias = medias.map((m) => (m.id === media.id ? media : m))
					dialogMedias.show()
				})}
				{...deleteMedia.enhance(async ({ submit }) => {
					await submit()
					dialogEdit.close()
					const media = deleteMedia.result
					if (media) medias = medias.filter((m) => m.id !== media.id)
					dialogMedias.show()
				})}
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
