<script lang="ts">
	import {
		CheckIcon,
		CircleAlertIcon,
		LinkIcon,
		LoaderCircleIcon,
		RotateCcwIcon,
		UnlinkIcon,
	} from '@lucide/svelte'
	import type { PageData } from './$types'
	import { ButtonDelete, InputBoolean, tip } from 'fuma'
	import { InputMedia } from '$lib/material/media'
	import { FORMAT_CARD } from '$lib/constant'
	import { debounce } from '$lib/debounce'
	import InputColorMap from './InputColorMap.svelte'
	import InputFieldSelect from './InputFieldSelect.svelte'
	import InputColorPalette from './InputColorPalette.svelte'
	import InputColor from './InputColor.svelte'
	import { browser } from '$app/environment'
	import { fade } from 'svelte/transition'
	import { deleteBadge, updateBadge } from './badge.remote'

	interface Props {
		badge: PageData['badge']
	}

	let { badge = $bindable() }: Props = $props()

	let submitButton: HTMLButtonElement = $state()!
	let isSuccess = $state(true)
	let lockAspectRatio = $state(true)

	// Les champs restent des `<input>` bruts liés à `badge`: ils pilotent l'aperçu en direct et
	// s'écrivent aussi par programme (ratio, restauration). Le schéma convertit à l'arrivée.
	function useAutosave() {
		if (!browser) return () => {}
		let firstCall = true
		return debounce(() => {
			if (!firstCall) {
				submitButton?.click()
			}
			firstCall = false
		}, 300)
	}
	const autosave = useAutosave()
	// `run()` de svelte/legacy, réécrit à l'identique: le pré-effet relance la sauvegarde
	// à chaque écriture sur `badge`.
	$effect.pre(() => {
		if (badge) autosave()
	})

	function aspectRatioWidth(value: number): number {
		return Math.round((value / FORMAT_CARD.aspect) * 100) / 100
	}
	function aspectRatioHeight(value: number): number {
		return Math.round(value * FORMAT_CARD.aspect * 100) / 100
	}
	const RatioIcon = $derived(lockAspectRatio ? LinkIcon : UnlinkIcon)
</script>

<form
	{...updateBadge.enhance(async ({ submit }) => {
		try {
			await submit()
			isSuccess = true
		} catch {
			isSuccess = false
		}
	})}
	class="flex flex-col gap-2"
>
	<label class="floating-label">
		<span>Nom de la configuration</span>
		<input class="input w-full" type="text" name="name" bind:value={badge.name} />
	</label>

	<div class="flex gap-2">
		<div class="w-28">
			<label class="floating-label">
				<span>Largeur (mm)</span>
				<input
					class="input"
					type="number"
					name="width"
					step="0.01"
					bind:value={badge.width}
					oninput={() => {
						if (lockAspectRatio) badge.height = aspectRatioWidth(badge.width)
					}}
				/>
			</label>
		</div>
		<button
			type="button"
			class="btn btn-sm btn-ghost btn-square self-end mb-2"
			onclick={() => (lockAspectRatio = !lockAspectRatio)}
			use:tip={{ content: 'Conserver le ratio' }}
		>
			<RatioIcon size={18} />
		</button>
		<div class="w-28">
			<label class="floating-label">
				<span>Hauteur (mm)</span>
				<input
					class="input"
					type="number"
					name="height"
					step="0.01"
					bind:value={badge.height}
					oninput={() => {
						if (lockAspectRatio) badge.width = aspectRatioHeight(badge.height)
					}}
				/>
			</label>
		</div>
		{#if badge.width !== FORMAT_CARD.x || badge.height !== FORMAT_CARD.y}
			<button
				in:fade
				type="button"
				class="btn btn-sm btn-ghost btn-square self-end mb-2"
				onclick={() => {
					badge.width = FORMAT_CARD.x
					badge.height = FORMAT_CARD.y
				}}
			>
				<span class="inline-flex" use:tip={{ content: 'Restaurer les dimensions par défaut' }}
					><RotateCcwIcon size={18} /></span
				>
			</button>
		{/if}
	</div>

	<div>
		<div class="label">
			<span class="label-text">Illustrations</span>
		</div>

		<div class="flex gap-4 items-center justify-around">
			<InputMedia
				label="Image de fond"
				key="backgroundId"
				bind:value={badge.backgroundId}
				x={FORMAT_CARD.x * 3}
				y={FORMAT_CARD.y * 3}
			/>

			<InputMedia key="logoId" label="Logo" bind:value={badge.logoId} />
		</div>
	</div>

	<InputFieldSelect
		field={updateBadge.fields.accessDaysField}
		label="Champ accès 1 (Liste à choix multiple)"
		bind:value={badge.accessDaysField}
		type="multiselect"
	/>
	<InputFieldSelect
		field={updateBadge.fields.accessSectorsField}
		label="Champ accès 2 (Liste à choix multiple)"
		bind:value={badge.accessSectorsField}
		type="multiselect"
	/>
	<InputFieldSelect
		field={updateBadge.fields.labelField}
		label="Champ: Label (Liste à choix ou text)"
		bind:value={badge.labelField}
		type="select"
		typesAccepted={['select', 'string']}
	/>
	<InputFieldSelect
		field={updateBadge.fields.typeField}
		label="Champ: Type de membre (Liste à choix)"
		bind:value={badge.typeField}
		type="select"
	/>

	<!-- Instance to place in /+layout.svelte -->
	<InputColorPalette />
	<InputColorMap field={badge.typeField} bind:value={badge.colorMap} />
	<InputColor name="colorDefault" label="(Couleur par défaut)" bind:value={badge.colorDefault} />

	<div class="flex gap-4">
		<div class="w-28">
			<label class="floating-label">
				<span>Tailles cellules</span>
				<input
					class="input"
					type="number"
					name="accessCellSize"
					bind:value={badge.accessCellSize}
				/>
			</label>
		</div>
		<InputBoolean
			field={updateBadge.fields.versoEnabled}
			label="Afficher le verso"
			checked={badge.versoEnabled}
			defaultChecked={badge.versoEnabled}
			onchange={(event) => (badge.versoEnabled = event.currentTarget.checked)}
		/>
	</div>

	<div class="flex gap-2">
		<button class="hidden" bind:this={submitButton}>Sauvegarder</button>

		<div class="grow"></div>

		{#if updateBadge.pending > 0}
			<div class="flex gap-1 items-center">
				<LoaderCircleIcon class="animate-spin text-warning" size={20} />
				<span class="text-sm text-base-content/70">Sauvegarde</span>
			</div>
		{:else if isSuccess}
			<div class="flex gap-1 items-center">
				<CheckIcon class="text-success" size={20} />
				<span class="text-sm text-base-content/70">Sauvegardé</span>
			</div>
		{:else}
			<div class="flex gap-1 items-center">
				<CircleAlertIcon class="text-error" size={20} />
				<span class="text-sm text-base-content/70">Erreur</span>
			</div>
		{/if}
	</div>
</form>

<form {...deleteBadge}>
	<ButtonDelete formaction={deleteBadge.action} />
</form>
