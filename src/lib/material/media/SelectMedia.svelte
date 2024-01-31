<script lang="ts">
	import { enhance } from '$app/forms'
	import type { Media } from '@prisma/client'
	import { page } from '$app/stores'
	import { DeleteButton, Dialog, Icon, InputText } from '$lib/material'
	import { useForm } from '$lib/validation'

	import CropperDialog from './CropperDialog.svelte'
	import { mdiPencilOutline, mdiPlus } from '@mdi/js'
	import { createEventDispatcher, tick } from 'svelte'

	let dialogMedias: HTMLDialogElement
	let dialogEdit: HTMLDialogElement
	let dialogCropper: CropperDialog
	const formUpload = useForm<{ media: Media }>({
		successReset: false,
		successUpdate: false,
		onSuccess(action, data) {
			dialogCropper.close()
			if (data) dispatch('select', data?.media)
		},
	})

	const formEdit = useForm({
		successReset: false,
		successUpdate: false,
		onSuccess(action) {
			// Invalidate medias
			dialogEdit.close()
		},
	})

	const dispatch = createEventDispatcher<{ select: Media }>()
	let selectedMedia: Media | undefined = undefined

	export function show() {
		dialogMedias.show()
	}

	function handleAddMedia() {
		dialogMedias.close()
		dialogCropper.show()
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

<Dialog bind:dialog={dialogMedias} class="z-10">
	<h3 slot="header" class="title">Médiatèque</h3>

	<div
		class="grid gap-3 items-start"
		style:grid-template-columns="repeat(auto-fill, minmax(min(6rem, 100%), 1fr)"
	>
		{#each $page.data.medias || [] as media}
			<button
				type="button"
				on:click={() => handleSelectMedia(media)}
				class="text-left border rounded-lg overflow-hidden"
			>
				<img
					src="/media/{media.id}?size=medium"
					alt={media.name}
					class="block border-b hover:scale-105 transition-transform origin-bottom"
				/>
				<div class="title-sm p-1 pl-3 flex items-center flex-wrap gap-2">
					<span>{media.name || '-'}</span>
					<button
						type="button"
						on:click|stopPropagation={() => handleEditMedia(media)}
						class="btn btn-xs btn-square btn-ghost ml-auto"
					>
						<Icon path={mdiPencilOutline} title="Modifier" size={14} class="fill-base-content/70" />
					</button>
				</div>
			</button>
		{/each}

		<button
			type="button"
			class="border rounded-lg grid place-content-center aspect-square group"
			on:click={handleAddMedia}
		>
			<Icon
				path={mdiPlus}
				class="fill-base-content/70 group-hover:scale-125 transition-transform"
				title="Ajouter une nouvelle image"
				size={42}
				tippyProps={{ appendTo: 'parent' }}
			/>
		</button>
	</div>
</Dialog>

<!-- Upload dialog -->
<form
	method="post"
	enctype="multipart/form-data"
	use:enhance={formUpload.submit}
	on:submit|preventDefault
>
	<CropperDialog
		bind:this={dialogCropper}
		title="Nouvelle image"
		inputName
		formaction="/{$page.params.eventId}/admin?/upload_media"
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
