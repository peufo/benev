<script lang="ts">
	import type { Event } from '@prisma/client'
	import { untrack } from 'svelte'
	import { slide } from 'svelte/transition'
	import { InputRange } from 'fuma'
	import { InputMedia } from '$lib/material'
	import { FORMAT_A3 } from '$lib/constant'
	import { theme } from '../theme/store'

	interface Props {
		event: Event
	}

	let { event }: Props = $props()

	// Affiche et logo se soumettent par leur id, comme le fond. `untrack`: la valeur de départ
	// est une graine, pas un lien — c'est le `{#key resetToken}` de la page qui remonte la
	// section pour les rétablir depuis `data.event`.
	let posterId = $state(untrack(() => event.posterId))
	let logoId = $state(untrack(() => event.logoId))

	// Les champs du thème n'ont pas de `field`: ils sont liés au store d'aperçu, qui repeint le
	// site en direct. Leur `name` porte ce qui est soumis.
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-start gap-6">
		<InputMedia
			key="posterId"
			label="Affiche"
			bind:value={posterId}
			x={FORMAT_A3.x / 3}
			y={FORMAT_A3.y / 3}
		/>

		<InputMedia key="logoId" label="Logo" bind:value={logoId} x={126} y={126} />

		<InputMedia
			key="backgroundImageId"
			label="Image de fond"
			bind:value={$theme.backgroundImageId}
		/>
	</div>

	<div class="divider my-0"></div>

	<div class="flex flex-wrap items-start gap-6">
		<label class="fieldset {$theme.backgroundImageId ? 'opacity-40' : ''}">
			<span class="label">Couleur de fond</span>
			<input
				disabled={!!$theme.backgroundImageId}
				type="color"
				name="backgroundColor"
				bind:value={$theme.backgroundColor}
				class="w-32 bg-base-100 px-2 rounded border"
			/>
		</label>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<InputRange
			label="Opacité des surfaces"
			name="cardOpacity"
			min={0.6}
			max={1}
			step={0.001}
			bind:value={$theme.cardOpacity}
			class="range-primary"
		/>

		<InputRange
			label="Flou du fond"
			name="backgroundBlur"
			min={0}
			max={200}
			bind:value={$theme.backgroundBlur}
			class="range-primary"
		/>

		<InputRange
			label="Brillance du fond"
			name="backgroundBrightness"
			min={0}
			max={300}
			bind:value={$theme.backgroundBrightness}
			class="range-primary"
		/>

		<InputRange
			label="Blanchissement du fond"
			name="backgroundWhiteness"
			min={0}
			max={1}
			step={0.02}
			bind:value={$theme.backgroundWhiteness}
			class="range-primary"
		/>

		<div>
			<button
				type="button"
				class="btn btn-ghost btn-sm"
				onclick={() => {
					$theme.backgroundBlur = 0
					$theme.backgroundBrightness = 100
					$theme.backgroundWhiteness = 0
				}}
			>
				Restaurer les paramètres
			</button>
		</div>
	</div>
</div>
