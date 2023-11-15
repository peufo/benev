<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { enhance } from '$app/forms'
	import { eventStates, useForm } from '$lib/form'
	import { InputText, InputTextarea, DeleteButton } from '$lib/material'
	import type { Event } from '@prisma/client'
	import { normalizePath } from '$lib/normalizePath'
	import { debounce } from '$lib/debounce'
	import { slide } from 'svelte/transition'
	import InputRadio from './material/input/InputRadio.svelte'

	let klass = ''
	export { klass as class }
	export let isUpdate = false
	export let event: Event | undefined = undefined
	export let successUpdate = true
	export let successReset = true

	const dispatch = createEventDispatcher<{ cancel: void; success: void }>()
	const form = useForm({ successCallback: () => dispatch('success'), successUpdate, successReset })

	let name = ''
	let webInput: HTMLInputElement
	let scrapLogoPending = false
	let logo = event?.logo || null
	const handleWebInput = debounce(async () => {
		const site = webInput.value
		scrapLogoPending = true
		const res = await fetch(`/api/scrap?site=${site}`)
			.then((res) => res.json())
			.finally(() => (scrapLogoPending = false))
		logo = res.logo
	}, 400)
</script>

<form
	method="post"
	action={isUpdate ? '?/update_event' : '/?/new_event'}
	class="{klass} flex flex-col gap-2"
	use:enhance={form.submit}
>
	{#if isUpdate && event}
		<InputText key="name" label="Nom de l'évènement" bind:value={event.name} />
		<InputText
			key="id"
			label="Lien de l'évenement"
			bind:value={event.id}
			hint="benev.io/{event.id}"
		/>
	{:else}
		<InputText
			key="name"
			label="Nom de l'évènement"
			bind:value={name}
			hint={name && `benev.io/${normalizePath(name)}`}
		/>
		<input type="hidden" name="id" value={normalizePath(name)} />
		<input type="hidden" name="timezone" value={new Date().getTimezoneOffset()} />
	{/if}

	<InputTextarea
		key="description"
		label="Description"
		value={event?.description || ''}
		textarea={{ rows: 4 }}
	/>

	<InputText
		key="web"
		label="Site web"
		value={event?.web || ''}
		bind:inputElement={webInput}
		on:input={handleWebInput}
		wrapperClass="flex items-center"
	>
		<div slot="append">
			{#if logo || scrapLogoPending}
				<div transition:slide={{ axis: 'x' }} class="w-10 grid place-content-center">
					{#if logo}
						<img src={logo} alt="logo" class="w-5" />
					{:else if scrapLogoPending}
						<div class="loading loading-ring loading-xs" />
					{/if}
				</div>
			{/if}
		</div>
	</InputText>

	<input type="hidden" name="logo" value={logo} />

	<InputText key="email" label="Email de contact" value={event?.email || ''} />
	<InputText key="phone" label="Téléphone de contact" value={event?.phone || ''} />
	<InputText key="address" label="Lieu" value={event?.address || ''} />

	<div class="flex gap-2 flex-row-reverse">
		<button class="btn" type="submit">Valider</button>

		{#if isUpdate}
			<DeleteButton formaction="?/delete_event" />
		{/if}
	</div>
</form>
