<script lang="ts">
	import { toast } from 'svelte-sonner'
	import type { PageData } from './$types'
	import { ButtonDelete, Icon, InputText, USE_COERCE_JSON, useForm } from 'fuma'
	import { mdiAlertCircleOutline, mdiCheck, mdiLoading } from '@mdi/js'
	import { invalidateAll } from '$app/navigation'
	import InputMedia from './InputMedia.svelte'
	import { FORMAT_CARD } from '$lib/constant'

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
			toast.error(JSON.stringify(failure))
			isSuccess = false
		},
	})

	function autosave() {
		submitButton.click()
	}
</script>

<form
	method="post"
	action="?/badge_update"
	on:input={autosave}
	use:enhance
	class="flex flex-col gap-2"
>
	<InputText key="name" label="Nom de la configuration" value={badge.name} />

	<div>
		<div class="label">
			<span class="label-text">Illustrations</span>
		</div>

		<div class="flex gap-2 items-center">
			<InputMedia
				label="Image de fond"
				key="backgroundId"
				value={badge.backgroundId}
				x={FORMAT_CARD.x * 3}
				y={FORMAT_CARD.y * 3}
				oninput={autosave}
			/>

			<InputMedia key="logoId" label="Logo" value={badge.logoId} oninput={autosave} />
		</div>
	</div>

	<!-- TODO: check aspect -->

	<pre>TODO: 
background: z.relation.connect,
logo: z.relation.connect,
typeField: z.relation.connect,
accessDaysField: z.relation.connect,
accessSectorsField: z.relation.connect,
colorMap: z.record(z.string()),
colorDefault: z.string(),
</pre>
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
