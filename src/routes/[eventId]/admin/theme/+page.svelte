<script lang="ts">
	import { slide } from 'svelte/transition'
	import { Card } from '$lib/fuma-legacy'
	import { toast } from 'svelte-sonner'
	import OnlyAdmin from '../OnlyAdmin.svelte'
	import { theme } from './store'
	import { InputMedia } from '$lib/material'
	import { updateTheme } from './theme.remote'

	// Les valeurs restent pilotées par le store `theme` (aperçu en direct). Les champs
	// portent maintenant leur `name` en clair: la remote function valide avec zod, sans
	// le jeton `USE_COERCE_NUMBER` que réclamait `parseFormData`.
</script>

<OnlyAdmin>
	<Card class="mx-auto" style="min-width: min(100%, 600px)">
		<h2 class="title">Thème du site</h2>
		<form
			{...updateTheme.enhance(async ({ submit }) => {
				await submit()
				toast.success('Thème enregistré')
			})}
			class="mt-4 flex flex-col gap-4"
		>
			<div class="flex gap-6">
				<InputMedia
					key="backgroundImageId"
					label="Image de fond"
					bind:value={$theme.backgroundImageId}
				/>

				<label class="flex flex-col gap-1 {$theme.backgroundImageId ? 'opacity-40' : ''}">
					<span class="label-text">Couleur de fond</span>
					<input
						disabled={!!$theme.backgroundImageId}
						type="color"
						name="backgroundColor"
						bind:value={$theme.backgroundColor}
						class="w-32 bg-base-100 px-2 rounded border"
					/>
				</label>
			</div>

			<label class="flex grow flex-col gap-1">
				<span class="label-text">Opacité des surfaces</span>
				<input
					type="range"
					name="cardOpacity"
					min="0.6"
					max="1"
					step="0.001"
					bind:value={$theme.cardOpacity}
					class="range range-primary range-sm"
				/>
			</label>

			{#if $theme.backgroundImageId}
				<div transition:slide class="flex flex-col gap-4">
					<label class="flex grow flex-col gap-1">
						<span class="label-text">Flou du fond</span>
						<input
							type="range"
							name="backgroundBlur"
							min="0"
							max="200"
							bind:value={$theme.backgroundBlur}
							class="range range-primary range-sm"
						/>
					</label>

					<label class="flex grow flex-col gap-1">
						<span class="label-text">Brillance du fond</span>
						<input
							type="range"
							name="backgroundBrightness"
							min="0"
							max="300"
							bind:value={$theme.backgroundBrightness}
							class="range range-primary range-sm"
						/>
					</label>

					<label class="flex grow flex-col gap-1">
						<span class="label-text">Blanchissement du fond</span>
						<input
							type="range"
							name="backgroundWhiteness"
							min="0"
							max="1"
							step="0.02"
							bind:value={$theme.backgroundWhiteness}
							class="range range-primary range-sm"
						/>
					</label>
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
			{/if}

			<div class="flex justify-end">
				<button class="btn btn-primary">Valider</button>
			</div>
		</form>
	</Card>
</OnlyAdmin>
