<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import InputText from '$lib/material/input/InputText.svelte'
	import InputTextarea from '$lib/material/input/InputTextarea.svelte'
	import type { Event } from '@prisma/client'

	let klass = ''
	export { klass as class }
	export let isUpdate = false
	export let event: Event | undefined = undefined
	export let successUpdate = true
	export let successReset = true

	const dispatch = createEventDispatcher<{ cancel: void; success: void }>()
	const form = useForm({ successCallback: () => dispatch('success'), successUpdate, successReset })

	let id = event?.id || ''
</script>

<form
	method="post"
	action={isUpdate ? '?/update_event' : '?/new_event'}
	class="{klass} flex flex-col gap-2"
	use:enhance={form.submit}
>
	{#if isUpdate}
		<h3 class="font-bold text-lg">Édition de l'évènement</h3>
	{:else}
		<h3 class="font-bold text-lg">Nouvel évènement</h3>
	{/if}

	<InputText key="name" label="Nom de l'évènement" value={event?.name} />

	{#if isUpdate}
		<input type="hidden" name="id" value={id} />
	{:else}
		<InputText
			key="id"
			label="URL"
			bind:value={id}
			hint="Attention, ne peut pas être changé plus tard. benev.ch/{id} "
		/>
	{/if}

	<InputTextarea key="description" label="Description" value={event?.description || ''} />

	<InputText key="web" label="Site web" value={event?.web || ''} />
	<InputText key="email" label="Email de contact" value={event?.email || ''} />
	<InputText key="phone" label="Téléphone de contact" value={event?.phone || ''} />
	<InputText key="address" label="Lieu" value={event?.address || ''} />

	<div class="flex gap-2 flex-row-reverse">
		<button class="btn" type="submit">Valider</button>

		{#if isUpdate}
			<button formaction="?/delete_event" class="btn btn-outline btn-error"> Supprimer </button>
		{/if}
		<div class="grow" />
		{#if !isUpdate}
			<button
				class="btn btn-ghost"
				type="button"
				on:click|preventDefault={() => dispatch('cancel')}
			>
				Annuler
			</button>
		{/if}
	</div>
</form>
