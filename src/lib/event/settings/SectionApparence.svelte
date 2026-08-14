<script lang="ts">
	import type { Event } from '@prisma/client'
	import { untrack } from 'svelte'
	import { InputRange } from 'fuma'
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

	/**
	 * Un champ affiche la valeur de son `field`, l'aperçu lit `theme`: reposer une valeur
	 * demande d'écrire les deux, comme le fait le `oninput` de chaque curseur.
	 */
	function restoreBackground() {
		theme.backgroundBlur = fields.backgroundBlur.set(0)
		theme.backgroundBrightness = fields.backgroundBrightness.set(100)
		theme.backgroundWhiteness = fields.backgroundWhiteness.set(0)
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-start gap-6">
		<InputMedia key="posterId" label="Affiche" bind:value={posterId} />

		<InputMedia key="logoId" label="Logo" bind:value={logoId} />

		<InputMedia
			key="backgroundImageId"
			label="Image de fond"
			bind:value={theme.backgroundImageId}
		/>
		<label class={['fieldset pt-0']}>
			<input
				{...fields.backgroundColor.as('color', event.backgroundColor)}
				oninput={(e) => (theme.backgroundColor = e.currentTarget.value)}
				class="w-40 h-40 bg-base-100 px-2 rounded-field border border-hard"
			/>
			<span class="label text-sm">Couleur de fond</span>
		</label>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<InputRange
			field={fields.cardOpacity}
			label="Opacité des surfaces"
			value={event.cardOpacity}
			min={0.6}
			max={1}
			step={0.001}
			oninput={(e) => (theme.cardOpacity = e.currentTarget.valueAsNumber)}
			class="range-primary"
		/>

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

		<div>
			<button type="button" class="btn btn-ghost btn-sm" onclick={restoreBackground}>
				Restaurer les paramètres
			</button>
		</div>
	</div>
</div>
