<script lang="ts">
	import { InputText, InputTextarea, InputImagePreview, Form, Icon } from 'fuma'
	import { slide } from 'svelte/transition'

	import type { Event } from '@prisma/client'
	import { normalizePath } from '$lib/normalizePath'
	import { debounce } from '$lib/debounce'
	import { FORMAT_A3 } from '$lib/constant'
	import EventDeleteButton from './EventDeleteButton.svelte'
	import { mdiTrashCanOutline } from '@mdi/js'
	import EventImageRemove from './EventImageRemove.svelte'

	export let event: Event | undefined = undefined

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

<Form
	action="/?/event"
	options={{
		successReset: false,
		onSubmit: async () => {
			if (event?.state !== 'actived') return
			if (event.id === eventId) return
			const msg = `Es tu sûr de vouloir modifier le lien de l'évènement de "/${event.id}" pour "${eventId} ?"`
			if (!confirm(msg)) {
				throw Error('Mise à jour annulé')
			}
		},
	}}
	on:success
	data={event}
>
	<InputText
		key="name"
		label="Nom de l'évènement"
		bind:value={name}
		on:input={handleNameInput}
		input={{ autocomplete: 'off' }}
	/>
	<InputText
		key="id"
		label="URL de l'évènement"
		on:input={handleEventIdInput}
		bind:value={eventId}
		input={{ class: 'pl-[5.4em]', autocomplete: 'off' }}
		classWrapper="flex items-center relative"
	>
		<span slot="prepend" class="absolute select-none pl-4 translate-y-[1px] opacity-50">
			benev.io/
		</span>
	</InputText>

	<div class="flex pt-2 gap-4 items-center justify-center">
		<div>
			<InputImagePreview
				key="poster"
				src={event?.posterId ? `/media/${event.posterId}` : ''}
				title="Affiche"
				alt="Affiche de l'évènement"
				aspect={FORMAT_A3.aspect}
				x={FORMAT_A3.x / 2}
				y={FORMAT_A3.y / 2}
			/>
			{#if event?.posterId}
				<EventImageRemove formaction="/?/event_poster_delete" eventId={event.id} />
			{/if}
		</div>

		<div>
			<InputImagePreview
				key="logo"
				src={event?.logoId ? `/media/${event.logoId}` : ''}
				title="Logo"
				alt="Logo de l'évènement"
				x={126}
				y={126}
			/>
			{#if event?.logoId}
				<EventImageRemove formaction="/?/event_logo_delete" eventId={event.id} />
			{/if}
		</div>
	</div>

	<InputTextarea
		key="description"
		label="Description"
		value={event?.description || ''}
		textarea={{ rows: 4 }}
	/>

	<input type="hidden" name="web" value={webValue} />

	<InputText key="email" label="Email de contact" value={event?.email || ''} />
	<InputText key="phone" label="Téléphone de contact" value={event?.phone || ''} />
	<InputText key="address" label="Lieu" value={event?.address || ''} />

	<InputText
		label="Site web"
		value={event?.web || ''}
		bind:inputElement={webInput}
		on:input={handleWebInput}
		classWrapper="flex items-center"
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

	<InputText key="facebook" label="Page Facebook" value={event?.facebook || ''} />
	<InputText key="instagram" label="Page Instagram" value={event?.instagram || ''} />

	<svelte:fragment slot="delete">
		<EventDeleteButton {event} />
	</svelte:fragment>
</Form>
