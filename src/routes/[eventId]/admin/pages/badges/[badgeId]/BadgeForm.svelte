<script lang="ts">
	import { SelectMedia } from '$lib/material'
	import { toast } from 'svelte-sonner'
	import type { PageData } from './$types'
	import { ButtonDelete, Icon, InputText, useForm } from 'fuma'
	import { mdiAlertCircleOutline, mdiCheck, mdiLoading } from '@mdi/js'
	import { invalidateAll } from '$app/navigation'

	export let badge: PageData['badge']

	let selectMedia: SelectMedia
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
	<pre>TODO: 
	background: z.relation.connect,
	logo: z.relation.connect,
	typeField: z.relation.connect,
	accessDaysField: z.relation.connect,
	accessSectorsField: z.relation.connect,
	colorMap: z.record(z.string()),
	colorDefault: z.string(),
    </pre>

	<InputText key="name" label="Nom de la configuration" />

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

<SelectMedia
	bind:this={selectMedia}
	on:select={({ detail: media }) => {
		toast.info('TODO: handle media select')
	}}
/>
