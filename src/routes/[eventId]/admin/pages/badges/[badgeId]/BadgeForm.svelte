<script lang="ts">
	import type { PageData } from './$types'
	import { ButtonDelete, Icon, InputText, InputNumber, InputBoolean, useForm } from 'fuma'
	import {
		mdiAlertCircleOutline,
		mdiCheck,
		mdiLoading,
		mdiLink,
		mdiLinkOff,
		mdiRestore,
	} from '@mdi/js'
	import { invalidateAll } from '$app/navigation'
	import { InputMedia } from '$lib/material/media'
	import { FORMAT_CARD } from '$lib/constant'
	import { debounce } from '$lib/debounce'
	import InputColorMap from './InputColorMap.svelte'
	import InputRelationField from './InputRelationField.svelte'
	import InputColorPalette from './InputColorPalette.svelte'
	import InputColor from './InputColor.svelte'
	import { browser } from '$app/environment'
	import { fade } from 'svelte/transition'

	export let badge: PageData['badge']

	let submitButton: HTMLButtonElement
	let isSuccess = true
	let lockAspectRatio = true

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

	function aspectRatioWidth(value: number): number {
		return Math.round((value / FORMAT_CARD.aspect) * 100) / 100
	}
	function aspectRatioHeight(value: number): number {
		return Math.round(value * FORMAT_CARD.aspect * 100) / 100
	}
</script>

<form method="post" action="?/badge_update" use:enhance class="flex flex-col gap-2">
	<InputText key="name" label="Nom de la configuration" bind:value={badge.name} />

	<div class="flex gap-2">
		<div class="w-28">
			<InputNumber
				key="width"
				label="Largeur (mm)"
				bind:value={badge.width}
				input={{ step: 0.01 }}
				on:input={() => {
					if (lockAspectRatio) {
						badge.height = aspectRatioWidth(badge.width)
					}
				}}
			/>
		</div>
		<button
			type="button"
			class="btn btn-sm btn-ghost btn-square self-end mb-2"
			on:click={() => (lockAspectRatio = !lockAspectRatio)}
		>
			<Icon path={lockAspectRatio ? mdiLink : mdiLinkOff} size={18} title="Conserver le ratio" />
		</button>
		<div class="w-28">
			<InputNumber
				key="height"
				label="Hauteur (mm)"
				bind:value={badge.height}
				input={{ step: 0.01 }}
				on:input={() => {
					if (lockAspectRatio) {
						badge.width = aspectRatioHeight(badge.height)
					}
				}}
			/>
		</div>
		{#if badge.width !== FORMAT_CARD.x || badge.height !== FORMAT_CARD.y}
			<button
				in:fade
				type="button"
				class="btn btn-sm btn-ghost btn-square self-end mb-2"
				on:click={() => {
					badge.width = FORMAT_CARD.x
					badge.height = FORMAT_CARD.y
				}}
			>
				<Icon path={mdiRestore} size={18} title="Restaurer les dimensions par défaut" />
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

	<div class="flex gap-4">
		<div class="w-28">
			<InputNumber
				key="accessCellSize"
				label="Tailles cellules"
				bind:value={badge.accessCellSize}
			/>
		</div>
		<InputBoolean key="versoEnabled" label="Afficher le verso" bind:value={badge.versoEnabled} />
	</div>

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
