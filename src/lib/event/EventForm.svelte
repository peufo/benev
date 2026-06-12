<script lang="ts">
	import { page } from '$app/stores'
	import { InputText, InputTextarea, InputImagePreview, Form } from 'fuma'
	import type { Event } from '@prisma/client'
	import { normalizePath } from '$lib/normalizePath'
	import { FORMAT_A3 } from '$lib/constant'
	import EventDeleteButton from './EventDeleteButton.svelte'
	import EventImageRemove from './EventImageRemove.svelte'
	import EventFormInputWeb from './EventFormInputWeb.svelte'
	import EventFormInputAddress from './EventFormInputAddress.svelte'
	import EventPlanSelector from './EventPlanSelector.svelte'
	import EventFormSection from './EventFormSection.svelte'

	export let event: Event | undefined = undefined

	const isUpdate = !!event
	let plan = $page.url.searchParams.get('plan') || 'basic'

	const timeZones = (() => {
		try {
			return Intl.supportedValuesOf('timeZone')
		} catch {
			return [
				'Europe/Zurich',
				'Europe/Paris',
				'Europe/Berlin',
				'America/New_York',
				'America/Los_Angeles',
				'Asia/Tokyo',
				'Asia/Shanghai',
				'Australia/Sydney',
				'Pacific/Auckland',
			]
		}
	})()

	let name = event?.name || ''
	let eventId = event?.id || ''

	function handleNameInput() {
		if (event?.state !== 'published') eventId = normalizePath(name)
	}

	function handleEventIdInput() {
		eventId = normalizePath(eventId)
	}
</script>

<Form
	action="/{event?.id ? event.id : ''}?/event"
	options={{
		successReset: false,
		onSubmit: async () => {
			if (event?.state !== 'published') return
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
	{#if !event}
		<EventPlanSelector bind:value={plan} />
	{/if}

	<div class="flex flex-col gap-3">
		<EventFormSection
			title="L'essentiel"
			step={isUpdate ? undefined : 1}
			required={isUpdate ? undefined : true}
			open
			collapsible={false}
		>
			<div class="flex flex-col gap-4">
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

				<label class="form-control w-full">
					<span class="label-text text-base-content/70">Fuseau horaire</span>
					<select
						name="timezone"
						class="select select-bordered w-full"
						value={event?.timezone || 'Europe/Zurich'}
					>
						{#each timeZones as timezone}
							<option value={timezone}>{timezone}</option>
						{/each}
					</select>
				</label>
			</div>
		</EventFormSection>

		<EventFormSection
			title="Identitée"
			step={isUpdate ? undefined : 2}
			required={isUpdate ? undefined : false}
			open={isUpdate}
			collapsible={!isUpdate}
		>
			<div class="flex flex-col gap-4">
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
			</div>
		</EventFormSection>

		<EventFormSection
			title="Pied de page"
			step={isUpdate ? undefined : 3}
			required={isUpdate ? undefined : false}
			open={isUpdate}
			collapsible={!isUpdate}
		>
			<div class="flex flex-col gap-4">
				<InputText key="email" label="Email de contact" value={event?.email || ''} />
				<InputText key="phone" label="Téléphone de contact" value={event?.phone || ''} />
				<EventFormInputAddress {event} />
				<EventFormInputWeb {event} />

				<InputText key="facebook" label="Page Facebook" value={event?.facebook || ''} />
				<InputText key="instagram" label="Page Instagram" value={event?.instagram || ''} />
			</div>
		</EventFormSection>
	</div>

	<svelte:fragment slot="delete">
		{#if event}
			<EventDeleteButton {event} />
		{/if}
	</svelte:fragment>
</Form>
