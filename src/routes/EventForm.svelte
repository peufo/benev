<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import {InputText, InputTextarea, DeleteButton} from '$lib/material'
	import type { Event } from '@prisma/client'
	import { normalizePath } from '$lib/normalizePath'

	let klass = ''
	export { klass as class }
	export let isUpdate = false
	export let event: Event | undefined = undefined
	export let successUpdate = true
	export let successReset = true

	const dispatch = createEventDispatcher<{ cancel: void; success: void }>()
	const form = useForm({ successCallback: () => dispatch('success'), successUpdate, successReset })

	let name = ''
</script>

<form
	method="post"
	action={isUpdate ? '?/update_event' : '?/new_event'}
	class="{klass} flex flex-col gap-2 max-w-sm"
	use:enhance={form.submit}
>
	{#if !isUpdate}
		<h3 class="font-bold text-lg">Nouvel évènement</h3>
	{/if}

	{#if isUpdate && event}
		<InputText
			key="name"
			label="Nom de l'évènement"
			bind:value={event.name}
			hint={isUpdate ? '' : `benev.ch/${event.id}`}
		/>
		<input type="hidden" name="id" value={event.id} />
	{:else}
		<InputText
			key="name"
			label="Nom de l'évènement"
			bind:value={name}
			hint={name && `benev.ch/${normalizePath(name)}`}
		/>
		<input type="hidden" name="id" value={normalizePath(name)} />
	{/if}

	<InputTextarea key="description" label="Description" value={event?.description || ''} />

	<InputText key="web" label="Site web" value={event?.web || ''} />
	<InputText key="email" label="Email de contact" value={event?.email || ''} />
	<InputText key="phone" label="Téléphone de contact" value={event?.phone || ''} />
	<InputText key="address" label="Lieu" value={event?.address || ''} />

	<div class="flex gap-2 flex-row-reverse">
		<button class="btn" type="submit">Valider</button>

		{#if isUpdate}
			<DeleteButton formaction="?/delete_event"/>
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
