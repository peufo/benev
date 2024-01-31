<script lang="ts">
	import { enhance } from '$app/forms'
	import type { Media } from '@prisma/client'
	import { page } from '$app/stores'
	import { Dialog, Icon } from '$lib/material'
	import { useForm } from '$lib/validation'

	import CropperDialog from './CropperDialog.svelte'
	import { mdiPlus } from '@mdi/js'
	import { createEventDispatcher } from 'svelte'

	let dialogMedias: HTMLDialogElement
	let dialogCropper: CropperDialog
	const formUpload = useForm<{ media: Media }>({
		onSuccess(action, data) {
			dialogCropper.close()
			if (data) dispatch('select', data?.media)
		},
	})

	const dispatch = createEventDispatcher<{ select: Media }>()

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
				<div class="title-sm px-3 py-2">{media.name || '-'}</div>
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
