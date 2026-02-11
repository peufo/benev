<script lang="ts" context="module">
	export type CropArea = { width: number; height: number; x: number; y: number }
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import Cropper from 'svelte-easy-crop'
	import { Dialog, InputText } from 'fuma'
	import { RulerDimensionLineIcon } from 'lucide-svelte'

	export let aspect = { x: 4, y: 3 }
	export let title = 'Nouvelle image'
	export let formaction: string | undefined = undefined
	export let key = ''
	export let freeName = false
	export let freeAspect = false

	let dialog: HTMLDialogElement
	let image = ''
	let crop: CropArea | undefined = undefined
	let inputFile: HTMLInputElement

	const dispatch = createEventDispatcher<{ submit: { crop: CropArea; image: string } }>()

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

	const aspects: { label: string; value: { x: number; y: number } }[] = [
		{ label: '16:9', value: { x: 16, y: 9 } },
		{ label: '3:2', value: { x: 3, y: 2 } },
		{ label: '4:3', value: { x: 4, y: 3 } },
		{ label: '1:1', value: { x: 1, y: 1 } },
		{ label: '2:3', value: { x: 2, y: 3 } },
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

			<div class="grow" />
			<label class="flex items-center gap-2 relative">
				<RulerDimensionLineIcon opacity={0.6} size={16} class="absolute left-2" />
				<input
					type="number"
					class="input input-bordered input-sm pr-0 pl-7 max-w-20"
					min={1}
					step={1}
					bind:value={aspect.x}
				/>
			</label>
			<label class="flex items-center gap-2 relative">
				<RulerDimensionLineIcon opacity={0.6} size={16} class="absolute left-2 rotate-90" />
				<input
					type="number"
					class="input input-bordered input-sm pr-0 pl-7 max-w-20"
					min={1}
					step={1}
					bind:value={aspect.y}
				/>
			</label>
		</div>
	{/if}

	<div class="relative rounded-lg overflow-hidden aspect-square">
		{#key aspect}
			<Cropper
				{image}
				aspect={aspect.x / aspect.y}
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
