<script lang="ts" context="module">
	export type Crop = { width: number; height: number; x: number; y: number }
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import Cropper from 'svelte-easy-crop'

	import { Dialog, InputText } from '$lib/material'

	export let aspect = 1
	export let title = 'Nouvelle image'
	export let formaction: string | undefined = undefined
	export let key = ''
	export let inputName = false
	let dialog: HTMLDialogElement
	let image = ''
	let crop: Crop | undefined = undefined
	let inputFile: HTMLInputElement

	const dispatch = createEventDispatcher<{ submit: { crop: Crop; image: string } }>()

	export function show() {
		inputFile.click()
	}

	export function close() {
		dialog?.close()
	}

	function onFileSelected() {
		if (!inputFile.files) return
		const file = inputFile.files[0]
		const reader = new FileReader()
		reader.onload = ({ target }) => {
			image = (target?.result || '') as string
			dialog?.showModal()
		}
		reader.readAsDataURL(file)
	}

	function handleValidation() {
		close()
		if (crop && image) dispatch('submit', { crop, image })
	}
</script>

<Dialog bind:dialog>
	<h2 slot="header" class="card-title">
		{title}
	</h2>

	<div class="relative rounded-lg overflow-hidden aspect-square">
		<Cropper
			{image}
			{aspect}
			showGrid={false}
			zoomSpeed={0.2}
			on:cropcomplete={(e) => (crop = e.detail.pixels)}
		/>
	</div>
	<div class="flex justify-end items-end gap-2 mt-2">
		<input type="hidden" name="{key ? `${key}_` : ''}crop" value={JSON.stringify(crop)} />
		<input
			class="hidden"
			type="file"
			name="{key ? `${key}_` : ''}image"
			accept="image/jpeg, image/png, image/webp, image/gif, image/avif, image/tiff"
			bind:this={inputFile}
			on:change={onFileSelected}
		/>

		{#if inputName}
			<InputText
				key="name"
				input={{ placeholder: "Description de l'image", autocomplete: 'off' }}
				class="grow"
			/>
		{/if}

		<button
			{formaction}
			type={formaction ? 'submit' : 'button'}
			class="btn btn-primary"
			on:click={handleValidation}
		>
			Valider
		</button>
	</div>
</Dialog>
