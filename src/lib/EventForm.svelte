<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/validation'
	import { slide } from 'svelte/transition'
	import {
		InputText,
		InputTextarea,
		DeleteButton,
		InputImage,
		ImagePlaceholder,
	} from '$lib/material'
	import type { Event } from '@prisma/client'
	import { normalizePath } from '$lib/normalizePath'
	import { debounce } from '$lib/debounce'
	import { FORMAT_A3 } from '$lib/constants'

	let klass = ''
	export { klass as class }
	export let isUpdate = false
	export let event: Event | undefined = undefined
	export let successUpdate = true
	export let successReset = true

	const dispatch = createEventDispatcher<{ cancel: void; success: void }>()
	const form = useForm({
		successCallback: () => dispatch('success'),
		successUpdate,
		successReset,
		beforeRequest: async () => {
			if (event?.state !== 'active') return
			if (event.id === eventId) return
			const msg = `Es tu sûr de vouloir modifier le lien de l'évenement de "/${event.id}" pour "${eventId} ?"`
			if (!confirm(msg)) {
				throw Error('Mise à jour annulé')
			}
		},
	})

	let name = event?.name || ''
	let eventId = event?.id || ''
	let webInput: HTMLInputElement
	let scrapIconPending = false
	let icon = event?.icon || null
	const handleWebInput = debounce(async () => {
		const site = webInput.value
		scrapIconPending = true
		const res = await fetch(`/api/scrap?site=${site}`)
			.then((res) => res.json())
			.finally(() => (scrapIconPending = false))
		icon = res.icon
	}, 400)

	function handleNameInput() {
		if (event?.state !== 'active') {
			eventId = normalizePath(name)
		}
	}

	function handleEventIdInput() {
		eventId = normalizePath(eventId)
	}
</script>

<form
	method="post"
	action={isUpdate ? '?/update_event' : '/?/new_event'}
	class="{klass} flex flex-col gap-2"
	use:enhance={form.submit}
>
	<InputText key="name" label="Nom de l'évènement" bind:value={name} on:input={handleNameInput} />
	<InputText
		key="id"
		label="Lien de l'évenement"
		on:input={handleEventIdInput}
		bind:value={eventId}
		hint="benev.io/{eventId}"
	/>

	<InputImage title="Affiche" aspect={FORMAT_A3.aspect}>
		{#if event?.posterId}
			<img src="{event.posterId}/original.webp" alt="Affiche de l'événement" />
		{:else}
			<ImagePlaceholder x={FORMAT_A3.x / 2} y={FORMAT_A3.y / 2}>Affiche</ImagePlaceholder>
		{/if}
	</InputImage>

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
			{#if icon || scrapIconPending}
				<div transition:slide={{ axis: 'x' }} class="w-10 grid place-content-center">
					{#if icon}
						<img src={icon} alt="Icon de l'événement" class="w-5" />
					{:else if scrapIconPending}
						<div class="loading loading-ring loading-xs" />
					{/if}
				</div>
			{/if}
		</div>
	</InputText>

	<input type="hidden" name="icon" value={icon} />

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
