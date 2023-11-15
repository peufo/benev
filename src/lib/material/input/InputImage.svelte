<script lang="ts">
	import Cropper from 'svelte-easy-crop'
	import type { Instance as TippyInstance } from 'tippy.js'
	import { mdiTrayArrowUp } from '@mdi/js'

	import { Dialog, DropDown, Icon } from '$lib/material'

	export let formaction = ''
	export let aspect = 1
	export let cropClass = 'aspect-square'
	let dialog: HTMLDialogElement
	let tip: TippyInstance
	let image = ''
	let crop: { width: number; height: number; x: number; y: number } | undefined = undefined
	let inputFile: HTMLInputElement

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

	export function close() {
		tip?.hide()
		dialog?.close()
	}
</script>

<DropDown tippyProps={{ arrow: true }} hideOnBlur bind:tip>
	<button
		slot="activator"
		type="button"
		class="rounded-lg hover:shadow-lg transition-shadow overflow-hidden block"
	>
		<slot>image</slot>
	</button>

	<div class="flex flex-col">
		<button type="button" class="relative menu-item" on:click={() => inputFile.click()}>
			<Icon path={mdiTrayArrowUp} class="opacity-70" size={20} />
			<span>Charger une image</span>
		</button>
		<slot name="actions" />
	</div>
</DropDown>

<Dialog bind:dialog>
	<h2 slot="header" class="card-title">Photo de profil</h2>

	<div class="relative rounded-lg overflow-hidden {cropClass}">
		<Cropper
			{image}
			{aspect}
			showGrid={false}
			zoomSpeed={0.2}
			on:cropcomplete={(e) => (crop = e.detail.pixels)}
		/>
	</div>
	<div class="flex justify-end mt-2">
		<input type="hidden" name="json_crop" value={JSON.stringify(crop)} />
		<input
			class="hidden"
			type="file"
			name="image"
			accept="image/jpeg, image/png, image/webp, image/gif, image/avif, image/tiff"
			bind:this={inputFile}
			on:change={onFileSelected}
		/>

		<button {formaction} class="btn btn-primary" on:click={close}> Valider </button>
	</div>
</Dialog>
