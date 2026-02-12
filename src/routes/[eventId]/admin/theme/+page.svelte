<script lang="ts">
	import { slide } from 'svelte/transition'
	import { Card, Form, FormControl, USE_COERCE_NUMBER } from 'fuma'
	import { toast } from 'svelte-sonner'
	import OnlyAdmin from '../OnlyAdmin.svelte'
	import { theme } from './store'
	import { InputMedia } from '$lib/material'
</script>

<OnlyAdmin>
	<Card class="mx-auto" style="min-width: min(100%, 600px)">
		<h2 class="title">Thème du site</h2>
		<Form
			class="mt-4"
			action="?/theme_update"
			simpleAction
			options={{
				successReset: false,
				onSuccess: () => {
					toast.success('Thème enregistré')
				},
			}}
		>
			<div class="flex gap-6">
				<InputMedia
					key="backgroundImageId"
					label="Image de fond"
					bind:value={$theme.backgroundImageId}
				/>

				<FormControl
					key="backgroundColor"
					label="Couleur de fond"
					let:key
					class={$theme.backgroundImageId ? 'opacity-40' : ''}
				>
					<input
						disabled={!!$theme.backgroundImageId}
						type="color"
						name={key}
						id={key}
						bind:value={$theme.backgroundColor}
						class="w-32 bg-base-100 px-2 rounded border"
					/>
				</FormControl>
			</div>

			<FormControl key="cardOpacity" let:key label="Opacité des surfaces" class="grow">
				<input type="hidden" name={key} value="{USE_COERCE_NUMBER}{$theme.cardOpacity}" />
				<input
					id={key}
					type="range"
					min="0.6"
					max="1"
					step="0.001"
					bind:value={$theme.cardOpacity}
					class="range range-primary range-sm"
				/>
			</FormControl>

			{#if $theme.backgroundImageId}
				<div transition:slide class="flex flex-col gap-4">
					<FormControl key="backgroundBlur" let:key label="Flou du fond" class="grow">
						<input type="hidden" name={key} value="{USE_COERCE_NUMBER}{$theme.backgroundBlur}" />
						<input
							id={key}
							type="range"
							min="0"
							max="200"
							bind:value={$theme.backgroundBlur}
							class="range range-primary range-sm"
						/>
					</FormControl>

					<FormControl key="backgroundBrightness" let:key label="Brillance du fond" class="grow">
						<input
							type="hidden"
							name={key}
							value="{USE_COERCE_NUMBER}{$theme.backgroundBrightness}"
						/>
						<input
							id={key}
							type="range"
							min="0"
							max="300"
							bind:value={$theme.backgroundBrightness}
							class="range range-primary range-sm"
						/>
					</FormControl>

					<FormControl
						key="backgroundWhiteness"
						let:key
						label="Blanchissement du fond"
						class="grow"
					>
						<input
							type="hidden"
							name={key}
							value="{USE_COERCE_NUMBER}{$theme.backgroundWhiteness}"
						/>
						<input
							id={key}
							type="range"
							min="0"
							max="1"
							step="0.02"
							bind:value={$theme.backgroundWhiteness}
							class="range range-primary range-sm"
						/>
					</FormControl>
					<div>
						<button
							type="button"
							class="btn btn-ghost btn-sm"
							on:click={() => {
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
		</Form>
	</Card>
</OnlyAdmin>
