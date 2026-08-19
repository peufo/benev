<script lang="ts" module>
	export type CropArea = { width: number; height: number; x: number; y: number }
</script>

<script lang="ts">
	import Cropper from 'svelte-easy-crop'
	import type { RemoteFormField } from '@sveltejs/kit'
	import { Dialog, InputString } from 'fuma'
	import { RulerDimensionLineIcon } from '@lucide/svelte'

	interface Props {
		aspect?: { x: number; y: number }
		title?: string
		formaction?: string | undefined
		key?: string
		/** Champ du formulaire englobant; fourni, il ouvre la saisie du nom de l'image. */
		nameField?: RemoteFormField<string>
		freeAspect?: boolean
		/** Remplacent les évènements de la version Svelte 4. */
		onsubmit?: (value: { crop: CropArea; image: string }) => void
	}

	let {
		aspect = $bindable({ x: 4, y: 3 }),
		title = 'Nouvelle image',
		formaction = undefined,
		key = '',
		nameField = undefined,
		freeAspect = false,
		onsubmit,
	}: Props = $props()

	let dialog: HTMLDialogElement = $state()!
	let image = $state('')
	let crop: CropArea | undefined = $state(undefined)
	let inputFile: HTMLInputElement = $state()!

	export function show() {
		inputFile.click()
	}

	/**
	 * Ouvre le recadrage sur un fichier déjà en main (glisser-déposer). Le fichier est écrit dans
	 * l'input du formulaire, et non gardé de côté: c'est lui qui part dans le `FormData`.
	 */
	export function showWith(file: File) {
		const transfer = new DataTransfer()
		transfer.items.add(file)
		inputFile.files = transfer.files
		onFileSelected()
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
		if (crop && image) onsubmit?.({ crop, image })
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
	{#snippet header()}
		<h2 class="card-title">
			{title}
		</h2>
	{/snippet}

	{#if freeAspect}
		<div class="flex gap-2 mb-2">
			{#each aspects as { label, value } (label)}
				<button
					type="button"
					class="btn btn-square btn-sm"
					class:btn-primary={aspect === value}
					onclick={() => (aspect = value)}
				>
					{label}
				</button>
			{/each}

			<div class="grow"></div>
			<label class="input input-sm w-20 pr-0">
				<RulerDimensionLineIcon opacity={0.6} size={27} />
				<input type="number" min={1} step={1} bind:value={aspect.x} />
			</label>
			<label class="input input-sm w-20 pr-0">
				<RulerDimensionLineIcon opacity={0.6} size={27} class="rotate-90" />
				<input type="number" min={1} step={1} bind:value={aspect.y} />
			</label>
		</div>
	{/if}

	<div class="relative rounded-lg overflow-hidden aspect-square">
		<!-- Tant qu'aucun fichier n'est choisi, pas de Cropper: monté avec `image=''` il se
		     plante dans son propre `$effect`, ce qui interrompt l'hydratation de toute la page. -->
		{#if image}
			{#key aspect}
				<Cropper
					{image}
					aspect={aspect.x / aspect.y}
					showGrid={false}
					zoomSpeed={0.2}
					oncropcomplete={({ pixels }) => (crop = pixels)}
				/>
			{/key}
		{/if}
	</div>
	<div class="flex justify-end items-end gap-2 mt-2">
		<input type="hidden" name="{key ? `${key}_` : ''}crop" value={JSON.stringify(crop)} />
		<input
			class="hidden"
			type="file"
			name="{key ? `${key}_` : ''}image"
			accept="image/jpeg, image/png, image/webp, image/gif, image/avif, image/tiff"
			bind:this={inputFile}
			onchange={onFileSelected}
		/>

		{#if nameField}
			<InputString
				label="Description de l'image"
				variant="floating"
				field={nameField}
				autocomplete="off"
				class="grow"
			/>
		{/if}

		<button
			{formaction}
			type={formaction ? 'submit' : 'button'}
			class="btn btn-primary"
			onclick={handleValidation}
		>
			Valider
		</button>
	</div>
</Dialog>
