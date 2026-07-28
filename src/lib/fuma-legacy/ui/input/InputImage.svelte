<script lang="ts" module>
	export type Crop = { width: number; height: number; x: number; y: number }
</script>

<script lang="ts">
	import { onMount } from 'svelte'
	import Cropper from 'svelte-easy-crop'
	import { mdiTrayArrowUp } from '@mdi/js'

	import type { TippyInstance } from 'fuma'
	import { Icon } from '$lib/fuma-legacy/ui/icon/index.js'
	import { DropDown } from 'fuma'
	import { Dialog } from 'fuma'

	interface Props {
		aspect?: number
		title?: string
		formaction?: string | undefined
		key?: string
		actions?: import('svelte').Snippet
		children?: import('svelte').Snippet
		/** Remplacent les évènements de la version Svelte 4. */
		onsubmit?: (value: { crop: Crop; image: string }) => void
	}

	let {
		aspect = 1,
		title = 'Image',
		formaction = undefined,
		key = '',
		actions,
		children,
		onsubmit,
	}: Props = $props()
	let dialog: HTMLDialogElement = $state()!
	let tip: TippyInstance = $state()!
	let image = $state('')
	let crop: Crop | undefined = $state(undefined)
	let inputFile: HTMLInputElement = $state()!

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

	onMount(() => {
		if (!actions) tip.disable()
	})
	function handleClickActivator() {
		if (!actions) inputFile.click()
	}

	function handleValidation() {
		close()
		if (crop && image) onsubmit?.({ crop, image })
	}
</script>

<DropDown tippyProps={{ arrow: true }} hideOnBlur bind:tip>
	{#snippet activator()}
		<button
			type="button"
			class="block overflow-hidden rounded-lg transition-shadow hover:shadow-lg"
			onclick={handleClickActivator}
		>
			{#if children}{@render children()}{:else}image{/if}
		</button>
	{/snippet}
	{#if actions}
		<div class="flex flex-col">
			<button
				type="button"
				class="menu-item relative"
				onclick={() => {
					inputFile.click()
				}}
			>
				<Icon path={mdiTrayArrowUp} class="opacity-70" size={20} />
				<span>Charger une image</span>
			</button>
			{@render actions?.()}
		</div>
	{/if}
</DropDown>

<Dialog bind:dialog>
	{#snippet header()}
		<h2 class="card-title">
			{title}
		</h2>
	{/snippet}

	<div class="relative aspect-square overflow-hidden rounded-lg">
		<Cropper
			{image}
			{aspect}
			showGrid={false}
			zoomSpeed={0.2}
			oncropcomplete={(e) => (crop = e.detail.pixels)}
		/>
	</div>
	<div class="mt-2 flex justify-end">
		<input type="hidden" name="{key ? `${key}_` : ''}crop" value={JSON.stringify(crop)} />
		<input
			class="hidden"
			type="file"
			name="{key ? `${key}_` : ''}image"
			accept="image/jpeg, image/png, image/webp, image/gif, image/avif, image/tiff"
			bind:this={inputFile}
			onchange={onFileSelected}
		/>

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
