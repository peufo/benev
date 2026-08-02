<script lang="ts" module>
	export type Crop = { width: number; height: number; x: number; y: number }
</script>

<script lang="ts">
	import Cropper from 'svelte-easy-crop'
	import { UploadIcon } from '@lucide/svelte'

	import { Popover, Dialog } from 'fuma'

	interface Props {
		aspect?: number
		title?: string
		formaction?: string | undefined
		key?: string
		/** Reçoit `hide` pour fermer le menu depuis un bouton de soumission (formaction). */
		actions?: import('svelte').Snippet<[{ hide: () => void }]>
		children?: import('svelte').Snippet
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
		dialog?.close()
	}

	function handleValidation() {
		close()
		if (crop && image) onsubmit?.({ crop, image })
	}
</script>

{#snippet preview()}
	{#if children}{@render children()}{:else}image{/if}
{/snippet}

<!-- Sans `actions`, il n'y a rien à mettre dans un menu: on ouvre directement le sélecteur
     de fichier. -->
{#if actions}
	<Popover placement="bottom-start">
		{#snippet trigger(popover)}
			<button
				type="button"
				class="block overflow-hidden rounded-lg transition-shadow hover:shadow-lg"
				{...popover.trigger}
			>
				{@render preview()}
			</button>
		{/snippet}
		{#snippet children(popover)}
			<div class="flex flex-col p-1">
				<button
					type="button"
					class="menu-item relative"
					onclick={() => {
						inputFile.click()
						popover.hide()
					}}
				>
					<UploadIcon class="opacity-70" size={20} />
					<span>Charger une image</span>
				</button>
				{@render actions({ hide: popover.hide })}
			</div>
		{/snippet}
	</Popover>
{:else}
	<button
		type="button"
		class="block overflow-hidden rounded-lg transition-shadow hover:shadow-lg"
		onclick={() => inputFile.click()}
	>
		{@render preview()}
	</button>
{/if}

<Dialog bind:dialog>
	{#snippet header()}
		<h2 class="card-title">
			{title}
		</h2>
	{/snippet}

	<div class="relative aspect-square overflow-hidden rounded-lg">
		<!-- Tant qu'aucun fichier n'est choisi, pas de Cropper: monté avec `image=''` il se
		     plante dans son propre `$effect`, ce qui interrompt l'hydratation de toute la page. -->
		{#if image}
			<Cropper
				{image}
				{aspect}
				showGrid={false}
				zoomSpeed={0.2}
				oncropcomplete={({ pixels }) => (crop = pixels)}
			/>
		{/if}
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
