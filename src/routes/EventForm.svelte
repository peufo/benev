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

	const dispatch = createEventDispatcher<{ cancel: void; success: void }>()
	const form = useForm({ successCallback: () => dispatch('success') })
</script>

<form
	method="post"
	action="?/new_event"
	class="{klass} flex flex-col gap-2"
	use:enhance={form.submit}
>
	{#if isUpdate}
		<h3 class="font-bold text-lg">Edition de l'évènement</h3>
	{:else}
		<h3 class="font-bold text-lg">Nouvel évènement</h3>
	{/if}

	<InputText key="name" label="Nom de l'évènement" />
	<InputText key="id" label="Identifiant" />
	<InputTextarea key="description" label="Description" />

	<div class="flex">
		<button class="btn btn-ghost" on:click|preventDefault={() => dispatch('cancel')}>Annuler</button
		>
		<div class="grow" />
		<button class="btn">Valider</button>
	</div>
</form>
