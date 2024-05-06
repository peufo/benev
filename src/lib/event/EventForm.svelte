<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { enhance } from '$app/forms'
	import { slide } from 'svelte/transition'
	import { useForm } from 'fuma/validation'
	import { InputText, InputTextarea, InputImagePreview } from 'fuma'
	import type { Event } from '@prisma/client'
	import { normalizePath } from '$lib/normalizePath'
	import { debounce } from '$lib/debounce'
	import { FORMAT_A3 } from '$lib/constant'
	import EventDeleteButton from './EventDeleteButton.svelte'

	let klass = ''
	export { klass as class }
	export let event: Event | undefined = undefined
	export let successUpdate = true
	export let successReset = true

	const dispatch = createEventDispatcher<{ cancel: void; success: void }>()
	const form = useForm({
		onSuccess: () => dispatch('success'),
		successUpdate,
		successReset,
		onSubmit: async () => {
			if (event?.state !== 'actived') return
			if (event.id === eventId) return
			const msg = `Es tu sûr de vouloir modifier le lien de l'évènement de "/${event.id}" pour "${eventId} ?"`
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
	let webValue = ''
	const handleWebInput = debounce(async () => {
		webValue = webInput.value ? `https://${webInput.value.replace(/https?:\/\//, '')}` : ''
		scrapIconPending = true
		const res = await fetch(`/api/scrap?site=${webValue}`)
			.then((res) => res.json())
			.finally(() => (scrapIconPending = false))
		icon = res.icon
	}, 400)

	function handleNameInput() {
		if (event?.state !== 'actived') {
			eventId = normalizePath(name)
		}
	}

	function handleEventIdInput() {
		eventId = normalizePath(eventId)
	}
</script>

<form
	method="post"
	enctype="multipart/form-data"
	action={event ? '?/update_event' : '/?/new_event'}
	class="{klass} flex flex-col gap-2"
	use:enhance={form.submit}
>
	<InputText key="name" label="Nom de l'évènement" bind:value={name} on:input={handleNameInput} />
	<InputText
		key="id"
		label="URL de l'évènement"
		on:input={handleEventIdInput}
		bind:value={eventId}
		input={{ class: 'pl-[5.4em]' }}
		wrapperClass="flex items-center relative"
	>
		<span slot="prepend" class="absolute select-none pl-4 translate-y-[1px] opacity-50">
			benev.io/
		</span>
	</InputText>

	<div class="flex pt-2 gap-4 items-center justify-center">
		<InputImagePreview
			key="poster"
			src={event?.posterId ? `/media/${event.posterId}` : ''}
			title="Affiche"
			alt="Affiche de l'évènement"
			aspect={FORMAT_A3.aspect}
			x={FORMAT_A3.x / 2}
			y={FORMAT_A3.y / 2}
		/>

		<InputImagePreview
			key="logo"
			src={event?.logoId ? `/media/${event.logoId}` : ''}
			title="Logo"
			alt="Logo de l'évènement"
			x={126}
			y={126}
		/>
	</div>

	<InputTextarea
		key="description"
		label="Description"
		value={event?.description || ''}
		textarea={{ rows: 4 }}
	/>

	<input type="hidden" name="web" value={webValue} />

	<InputText
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
						<img src={icon} alt="Icon de l'évènement" class="w-5" />
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
	</div>
</form>

{#if event}
	<hr />
	<EventDeleteButton {event} />
{/if}
