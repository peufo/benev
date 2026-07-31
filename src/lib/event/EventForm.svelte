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

	const isUpdate = $derived(!!event)
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

	// `name` et `id` sont couplés (l'un dérive l'autre): la saisie du nom écrit dans le champ
	// `id`, dont le remote form est la source de vérité une fois le formulaire monté.
	// `Event` désignant ici le modèle Prisma, l'évènement DOM se type par sa cible.
	function handleNameInput({ currentTarget }: { currentTarget: HTMLInputElement }) {
		if (event?.state === 'published') return
		remoteForm.fields.id.set(normalizePath(currentTarget.value))
	}

	function handleEventIdInput({ currentTarget }: { currentTarget: HTMLInputElement }) {
		remoteForm.fields.id.set(normalizePath(currentTarget.value))
	}

	function confirmIdChange() {
		if (!event || event.state !== 'published') return true
		// Tant que rien n'a été saisi, le champ n'a pas de valeur: c'est celle d'origine.
		const eventId = remoteForm.fields.id.value() ?? event.id
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
				<InputString
					field={remoteForm.fields.name}
					label="Nom de l'évènement"
					value={event?.name || ''}
					autocomplete="off"
					oninput={handleNameInput}
				/>

				<!-- Le préfixe se pose par-dessus le champ, hors du `fieldset` que rend `InputString`:
				     `top-7` = padding du fieldset + hauteur du label + gap, `h-10` = hauteur de `.input`. -->
				<div class="relative">
					<span
						class="absolute top-7 z-1 flex h-10 items-center pl-4 text-sm opacity-50 select-none pointer-events-none"
					>
						benev.io/
					</span>
					<InputString
						field={remoteForm.fields.id}
						label="URL de l'évènement"
						value={event?.id || ''}
						autocomplete="off"
						class="[&_input]:pl-[5.4em]"
						oninput={handleEventIdInput}
					/>
				</div>

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
