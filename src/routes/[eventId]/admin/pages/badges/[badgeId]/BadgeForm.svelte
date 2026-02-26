<script lang="ts">
	import type { PageData } from './$types'
	import { ButtonDelete, Icon, InputText, useForm } from 'fuma'
	import { mdiAlertCircleOutline, mdiCheck, mdiLoading } from '@mdi/js'
	import { invalidateAll } from '$app/navigation'
	import { InputMedia } from '$lib/material/media'
	import { FORMAT_CARD } from '$lib/constant'
	import { debounce } from '$lib/debounce'
	import InputColorMap from './InputColorMap.svelte'
	import InputRelationField from './InputRelationField.svelte'
	import InputColorPalette from './InputColorPalette.svelte'
	import InputColor from './InputColor.svelte'
	import { browser } from '$app/environment'

	export let badge: PageData['badge']

	let submitButton: HTMLButtonElement
	let isSuccess = true

	const { enhance, isLoading } = useForm({
		successUpdate: false,
		successMessage: false,
		submitOnChange: true,
		onSuccess(url) {
			isSuccess = true
			if (url.searchParams.has('/badge_delete')) invalidateAll()
		},
		onFail(failure) {
			isSuccess = false
		},
	})

	// Not beautiful, but that work
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
	$: if (badge) autosave()
</script>

<form method="post" action="?/badge_update" use:enhance class="flex flex-col gap-2">
	<InputText key="name" label="Nom de la configuration" bind:value={badge.name} />

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

	<InputRelationField
		key="accessDaysField"
		label="Champ accès 1 (Liste à choix multiple)"
		bind:value={badge.accessDaysField}
		type="multiselect"
	/>
	<InputRelationField
		key="accessSectorsField"
		label="Champ accès 2 (Liste à choix multiple)"
		bind:value={badge.accessSectorsField}
		type="multiselect"
	/>
	<InputRelationField
		key="labelField"
		label="Champ: Label (Liste à choix ou text)"
		bind:value={badge.labelField}
		type="select"
		typesAccepted={['select', 'string']}
	/>
	<InputRelationField
		key="typeField"
		label="Champ: Type de membre (Liste à choix)"
		bind:value={badge.typeField}
		type="select"
	/>

	<!-- Instance to place in /+layout.svelte -->
	<InputColorPalette />
	<InputColorMap field={badge.typeField} bind:value={badge.colorMap} />
	<InputColor name="colorDefault" label="(Couleur par défaut)" bind:value={badge.colorDefault} />

	<div class="flex gap-2">
		<button class="hidden" bind:this={submitButton}>Sauvegarder</button>

		<ButtonDelete formaction="?/badge_delete" />
		<div class="grow" />

		{#if $isLoading}
			<div class="flex gap-1 items-center">
				<Icon path={mdiLoading} class="animate-spin fill-warning" size={20} />
				<span class="text-sm text-base-content/70">Sauvegarde</span>
			</div>
		{:else if isSuccess}
			<div class="flex gap-1 items-center">
				<Icon path={mdiCheck} class="fill-success" size={20} />
				<span class="text-sm text-base-content/70">Sauvegardé</span>
			</div>
		{:else}
			<div class="flex gap-1 items-center">
				<Icon path={mdiAlertCircleOutline} class="fill-error" size={20} />
				<span class="text-sm text-base-content/70">Erreur</span>
			</div>
		{/if}
	</div>
</form>
