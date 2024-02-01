<script lang="ts">
	import { enhance } from '$app/forms'
	import type { Media } from '@prisma/client'
	import { page } from '$app/stores'
	import { DeleteButton, Dialog, Icon, InputText } from '$lib/material'
	import { useForm } from '$lib/validation'

	import UploadMediaDialog from './UploadMediaDialog.svelte'
	import { mdiPencilOutline, mdiPlus } from '@mdi/js'
	import { createEventDispatcher, tick } from 'svelte'

	let medias: Media[] = $page.data.medias || []
	page.subscribe(({ data }) => (medias = data.medias || []))

	let dialogMedias: HTMLDialogElement
	let dialogEdit: HTMLDialogElement
	let dialogUploadMedia: UploadMediaDialog
	const formUpload = useForm<Media>({
		successUpdate: false,
		successMessage: 'Nouvelle image',
		onSuccess(action, media) {
			dialogUploadMedia.close()
			if (media) {
				medias = [...medias, media]
				dispatch('select', media)
			}
		},
	})

	const formEdit = useForm<Media>({
		successUpdate: false,
		onSuccess(action, media) {
			dialogEdit.close()
			if (!media) return
			if (action.search === '?/delete_media') {
				const index = medias.findIndex((m) => m.id === media.id)
				medias = [...medias.slice(0, index), ...medias.slice(index + 1)]
			}
			if (action.search === '?/edit_media') {
				medias = medias.map((m) => (m.id === media.id ? media : m))
			}
			dialogMedias.show()
		},
	})

	const dispatch = createEventDispatcher<{ select: Media }>()
	let selectedMedia: Media | undefined = undefined

	export function show() {
		dialogMedias.show()
	}

	function handleAddMedia() {
		dialogMedias.close()
		dialogUploadMedia.show()
	}

	function handleSelectMedia(media: Media) {
		dialogMedias.close()
		dispatch('select', media)
	}

	async function handleEditMedia(media: Media) {
		selectedMedia = media
		await tick()
		dialogMedias.close()
		dialogEdit.showModal()
	}
</script>

<Dialog bind:dialog={dialogMedias}>
	<h3 slot="header" class="title">Médiatèque</h3>

	<div
		class="grid gap-3 items-start"
		style:grid-template-columns="repeat(auto-fill, minmax(min(6rem, 100%), 1fr)"
	>
		{#each medias as media}
			<button
				type="button"
				on:click={() => handleSelectMedia(media)}
				class="text-left border rounded-lg outline-primary/50 outline-1 hover:outline p-1 flex flex-col gap-1"
			>
				<img src="/media/{media.id}" alt={media.name} class="rounded" />

				<div class="flex items-center w-full flex-wrap gap-2">
					<span class="title-sm h-6">{media.name || '-'}</span>
					{#if media.eventId}
						<button
							type="button"
							on:click|stopPropagation={() => handleEditMedia(media)}
							class="btn btn-xs btn-square btn-ghost ml-auto"
						>
							<Icon
								path={mdiPencilOutline}
								title="Modifier"
								size={14}
								class="fill-base-content/70"
							/>
						</button>
					{/if}
				</div>
			</button>
		{/each}

		<button
			type="button"
			class="border rounded-lg grid place-content-center aspect-square outline-primary/50 outline-1 hover:outline"
			on:click={handleAddMedia}
		>
			<Icon
				path={mdiPlus}
				class="fill-base-content/70"
				title="Ajouter une nouvelle image"
				size={42}
				tippyProps={{ appendTo: 'parent' }}
			/>
		</button>
	</div>
</Dialog>

<form
	method="post"
	enctype="multipart/form-data"
	use:enhance={formUpload.submit}
	on:submit|preventDefault
>
	<UploadMediaDialog
		bind:this={dialogUploadMedia}
		title="Nouvelle image"
		formaction="/{$page.params.eventId}/admin?/upload_media"
		freeName
		freeAspect
	/>
</form>

{#if selectedMedia}
	<Dialog bind:dialog={dialogEdit}>
		<h3 slot="header" class="title">Edition d'une image</h3>

		<img src="/media/{selectedMedia.id}" alt={selectedMedia.name} class="mx-auto" />

		<form method="post" class="contents" use:enhance={formEdit.submit}>
			<div class="flex flex-row-reverse items-end gap-2 mt-4">
				<input type="hidden" name="id" value={selectedMedia.id} />

				<button formaction="/{$page.params.eventId}/admin?/edit_media" class="btn btn-primary">
					Valider
				</button>
				<DeleteButton formaction="/{$page.params.eventId}/admin?/delete_media" />

				<InputText
					key="name"
					input={{ placeholder: "Description de l'image", autocomplete: 'off' }}
					class="grow"
					value={selectedMedia.name}
				/>
			</div>
		</form>
	</Dialog>
{/if}
