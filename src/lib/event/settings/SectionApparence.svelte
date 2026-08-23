<script lang="ts">
	import type { Event } from '@prisma/client'
	import { tick, untrack } from 'svelte'
	import { InputRange } from 'fuma'
	import { THEME_PRESETS, type ThemePresetKey } from '$lib/constant'
	import { InputMedia } from '$lib/material'
	import { theme } from '../theme/state.svelte'
	import type { EventSettingsFields } from './types'

	interface Props {
		fields: EventSettingsFields
		event: Event
	}

	let { fields, event }: Props = $props()

	// Affiche et logo se soumettent par leur id, comme le fond. `untrack`: la valeur de départ
	// est une graine, pas un lien — c'est le `{#key resetToken}` de la page qui remonte la
	// section pour les rétablir depuis `data.event`.
	let posterId = $state(untrack(() => event.posterId))
	let logoId = $state(untrack(() => event.logoId))

	let presetInput = $state<HTMLInputElement>()

	let activePreset = $derived(
		theme.backgroundPreset && theme.backgroundPreset in THEME_PRESETS
			? (theme.backgroundPreset as ThemePresetKey)
			: undefined
	)

	/**
	 * La barre de sauvegarde ne resérialise le formulaire que sur un évènement DOM, et ni
	 * `fields.set()` ni une écriture dans `theme` n'en émettent: le champ du thème annonce
	 * lui-même la nouvelle donne, comme le fait `InputMedia`. Attendre le rendu, sans quoi
	 * c'est l'ancienne valeur qui serait relue.
	 */
	function notifyForm() {
		void tick().then(() => presetInput?.dispatchEvent(new Event('input', { bubbles: true })))
	}

	function selectPreset(key: ThemePresetKey) {
		const preset = THEME_PRESETS[key]
		theme.backgroundPreset = key
		// Un thème et une image de médiathèque s'excluent: c'est le média qui prime au rendu.
		theme.backgroundImageId = null
		theme.backgroundBlur = fields.backgroundBlur.set(preset.backgroundBlur)
		theme.backgroundBrightness = fields.backgroundBrightness.set(preset.backgroundBrightness)
		theme.backgroundWhiteness = fields.backgroundWhiteness.set(preset.backgroundWhiteness)
		theme.backgroundGrain = fields.backgroundGrain.set(preset.backgroundGrain)
		notifyForm()
	}

	/** Retire le thème sans toucher aux réglages ni au média: seule l'image prédéfinie s'en va. */
	function clearPreset() {
		theme.backgroundPreset = null
		notifyForm()
	}
</script>

<div class="flex flex-col gap-6">
	<div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));">
		<InputMedia key="posterId" label="Affiche" bind:value={posterId} />

		<InputMedia key="logoId" label="Logo" bind:value={logoId} />

		<InputMedia
			key="backgroundImageId"
			label="Image de fond"
			bind:value={theme.backgroundImageId}
			oninput={(media) => media && clearPreset()}
		/>
		<label class={['fieldset pt-0']}>
			<input
				{...fields.backgroundColor.as('color', event.backgroundColor)}
				oninput={(e) => (theme.backgroundColor = e.currentTarget.value)}
				class="bg-base-100 px-2 rounded-field border border-hard w-full h-full aspect-square"
			/>
			<span class="label text-sm">Couleur de fond</span>
		</label>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<InputRange
			field={fields.backgroundBlur}
			label="Flou du fond"
			value={event.backgroundBlur}
			min={0}
			max={200}
			oninput={(e) => (theme.backgroundBlur = e.currentTarget.valueAsNumber)}
			class="range-primary"
		/>

		<InputRange
			field={fields.backgroundBrightness}
			label="Brillance du fond"
			value={event.backgroundBrightness}
			min={0}
			max={300}
			oninput={(e) => (theme.backgroundBrightness = e.currentTarget.valueAsNumber)}
			class="range-primary"
		/>

		<InputRange
			field={fields.backgroundWhiteness}
			label="Blanchissement du fond"
			value={event.backgroundWhiteness}
			min={0}
			max={1}
			step={0.02}
			oninput={(e) => (theme.backgroundWhiteness = e.currentTarget.valueAsNumber)}
			class="range-primary"
		/>

		<InputRange
			field={fields.backgroundGrain}
			label="Grain"
			value={event.backgroundGrain}
			min={0}
			max={1}
			step={0.02}
			oninput={(e) => (theme.backgroundGrain = e.currentTarget.valueAsNumber)}
			class="range-primary"
		/>

		<div class="flex flex-col gap-2 col-span-full">
			<span class="label text-sm">Thème</span>
			<div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Choisir un thème">
				<button
					type="button"
					role="radio"
					aria-checked={!activePreset}
					onclick={clearPreset}
					class="flex flex-col items-center gap-1.5 rounded-field border p-1.5 transition-colors {!activePreset
						? 'border-primary bg-primary/5'
						: 'border-soft hover:border-primary/50 hover:bg-base-200/30'}"
				>
					<span
						class="h-12 w-20 rounded-field border border-soft bg-cover bg-center"
						style="
						background-color: {theme.backgroundColor};
						{theme.backgroundImageId ? `background-image: url(/media/${theme.backgroundImageId})` : ''}
					"
					></span>
					<span class="text-xs">Personnalisé</span>
				</button>

				{#each Object.entries(THEME_PRESETS) as [key, preset] (key)}
					{@const selected = activePreset === key}
					<button
						type="button"
						role="radio"
						aria-checked={selected}
						onclick={() => selectPreset(key as ThemePresetKey)}
						class="flex flex-col items-center gap-1.5 rounded-field border p-1.5 transition-colors {selected
							? 'border-primary bg-primary/5'
							: 'border-soft hover:border-primary/50 hover:bg-base-200/30'}"
					>
						<span
							class="h-12 w-20 rounded-field border border-soft bg-cover bg-center"
							style="background-image: url({preset.image})"
						></span>
						<span class="text-xs">{preset.label}</span>
					</button>
				{/each}
			</div>
			<!-- Piloté par `theme` plutôt que par un `field`: l'aperçu et la soumission n'ont ainsi
		     qu'une source, et le `reset` natif du formulaire le rend à sa valeur enregistrée. -->
			<input
				type="hidden"
				bind:this={presetInput}
				name="backgroundPreset"
				value={theme.backgroundPreset ?? ''}
			/>
		</div>
	</div>
</div>
