<script lang="ts">
	import type { Event } from '@prisma/client'
	import { InputSelectNative, InputString } from 'fuma'
	import { normalizePath } from '$lib/normalizePath'
	import { timezoneOptions } from '$lib/timezone'
	import type { EventFields } from './types'

	interface Props {
		fields: EventFields
		event?: Event | undefined
	}

	let { fields, event = undefined }: Props = $props()

	// `name` et `id` sont couplés (l'un dérive l'autre): la saisie du nom écrit dans le champ
	// `id`, dont le remote form est la source de vérité une fois le formulaire monté.
	// `Event` désignant ici le modèle Prisma, l'évènement DOM se type par sa cible.
	function handleNameInput({ currentTarget }: { currentTarget: HTMLInputElement }) {
		if (event?.state === 'published') return
		fields.id.set(normalizePath(currentTarget.value))
	}

	function handleEventIdInput({ currentTarget }: { currentTarget: HTMLInputElement }) {
		fields.id.set(normalizePath(currentTarget.value))
	}
</script>

<div class="flex flex-col gap-4">
	<InputString
		field={fields.name}
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
			field={fields.id}
			label="URL de l'évènement"
			value={event?.id || ''}
			autocomplete="off"
			class="[&_input]:pl-[5.4em]"
			oninput={handleEventIdInput}
		/>
	</div>

	<InputSelectNative
		field={fields.timezone}
		label="Fuseau horaire"
		options={timezoneOptions(event?.timezone)}
		value={event?.timezone || 'Europe/Zurich'}
	/>
</div>
