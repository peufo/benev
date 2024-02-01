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
	export let freeName = false
	export let freeAspect = false

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

	const aspects: { label: string; value: number }[] = [
		{ label: '16:9', value: 16 / 9 },
		{ label: '3:2', value: 3 / 2 },
		{ label: '4:3', value: 4 / 3 },
		{ label: '1:1', value: 1 },
		{ label: '2:3', value: 2 / 3 },
	]
</script>

<Dialog bind:dialog>
	<h2 slot="header" class="card-title">
		{title}
	</h2>

	{#if freeAspect}
		<div class="flex gap-2 mb-2">
			{#each aspects as { label, value }}
				<button
					type="button"
					class="btn btn-square btn-sm"
					class:btn-primary={aspect === value}
					on:click={() => (aspect = value)}
				>
					{label}
				</button>
			{/each}
		</div>
	{/if}

	<div class="relative rounded-lg overflow-hidden aspect-square">
		{#key aspect}
			<Cropper
				{image}
				{aspect}
				showGrid={false}
				zoomSpeed={0.2}
				on:cropcomplete={(e) => (crop = e.detail.pixels)}
			/>
		{/key}
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

		{#if freeName}
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
