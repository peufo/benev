<script lang="ts">
	import { page } from '$app/state'
	import { InputImagePreview } from '$lib/fuma-legacy'
	import { InputString, InputTextarea } from 'fuma'
	import type { Event } from '@prisma/client'
	import { normalizePath } from '$lib/normalizePath'
	import { FORMAT_A3 } from '$lib/constant'
	import EventDeleteButton from './EventDeleteButton.svelte'
	import EventImageRemove from './EventImageRemove.svelte'
	import EventFormInputWeb from './EventFormInputWeb.svelte'
	import { InputLocation } from '$lib/location'
	import EventTierSelector from './EventTierSelector.svelte'
	import EventFormSection from './EventFormSection.svelte'
	import { createEvent, updateEvent } from './event.remote'

	interface Props {
		event?: Event | undefined
		onsuccess?: () => void
	}

	let { event = undefined, onsuccess }: Props = $props()

	const isUpdate = !!event
	// Deux remote functions distinctes, l'ancienne action `?/event` étant suffixée par
	// `_create` ou `_update` selon la présence d'un id.
	const remoteForm = $derived(event ? updateEvent : createEvent)
	let plan = $state(page.url.searchParams.get('plan') || 'basic')

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

	// `name` et `id` sont couplés (l'un dérive l'autre): ils restent des champs bruts liés.
	let name = $state(event?.name || '')
	let eventId = $state(event?.id || '')

	function handleNameInput() {
		if (event?.state !== 'published') eventId = normalizePath(name)
	}

	function handleEventIdInput() {
		eventId = normalizePath(eventId)
	}

	function confirmIdChange() {
		if (!event || event.state !== 'published') return true
		if (event.id === eventId) return true
		return confirm(
			`Es tu sûr de vouloir modifier le lien de l'évènement de "/${event.id}" pour "${eventId} ?"`
		)
	}
</script>

<form
	{...remoteForm.enhance(async ({ submit }) => {
		if (!confirmIdChange()) return
		await submit()
		onsuccess?.()
	})}
	enctype="multipart/form-data"
	class="flex flex-col gap-4"
>
	{#if !event}
		<EventTierSelector bind:value={plan} />
		<input type="hidden" name="tier" value={plan} />
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
				<label class="floating-label">
					<span>Nom de l'évènement</span>
					<input
						class="input w-full"
						type="text"
						name="name"
						autocomplete="off"
						bind:value={name}
						oninput={handleNameInput}
					/>
				</label>

				<label class="floating-label relative">
					<span>URL de l'évènement</span>
					<span class="absolute z-1 select-none pl-4 translate-y-[0.7em] opacity-50">
						benev.io/
					</span>
					<input
						class="input w-full pl-[5.4em]"
						type="text"
						name="id"
						autocomplete="off"
						bind:value={eventId}
						oninput={handleEventIdInput}
					/>
				</label>

				<label class="form-control w-full">
					<span class="label-text p-1">Fuseau horaire</span>
					<select name="timezone" class="select w-full" value={event?.timezone || 'Europe/Zurich'}>
						{#each timeZones as timezone (timezone)}
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
							<EventImageRemove kind="poster" eventId={event.id} />
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
							<EventImageRemove kind="logo" eventId={event.id} />
						{/if}
					</div>
				</div>

				<InputTextarea
					field={remoteForm.fields.description}
					label="Description"
					value={event?.description || ''}
					rows={4}
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
				<InputString
					field={remoteForm.fields.email}
					label="Email de contact"
					value={event?.email || ''}
				/>
				<InputString
					field={remoteForm.fields.phone}
					label="Téléphone de contact"
					value={event?.phone || ''}
				/>
				<InputLocation key="location" value={event?.location ?? null} />
				<EventFormInputWeb {event} />

				<InputString
					field={remoteForm.fields.facebook}
					label="Page Facebook"
					value={event?.facebook || ''}
				/>
				<InputString
					field={remoteForm.fields.instagram}
					label="Page Instagram"
					value={event?.instagram || ''}
				/>
			</div>
		</EventFormSection>
	</div>

	{#each remoteForm.fields.allIssues() ?? [] as issue (issue.path.join('.') + issue.message)}
		<p class="text-error text-sm">{issue.message}</p>
	{/each}

	<div class="flex flex-row-reverse gap-2 border-t pt-4">
		<button class="btn btn-primary">Valider</button>
	</div>
</form>

{#if event}
	<EventDeleteButton {event} />
{/if}
