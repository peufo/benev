<script lang="ts">
	import type { Event } from '@prisma/client'
	import { InputString } from 'fuma'
	import { InputLocation } from '#lib/location/index.js'
	import EventFormInputWeb from '../EventFormInputWeb.svelte'
	import type { EventFields } from './types'

	interface Props {
		fields: EventFields
		event?: Event | undefined
	}

	let { fields, event = undefined }: Props = $props()
</script>

<div class="flex flex-col gap-4">
	<InputString field={fields.email} label="Email de contact" value={event?.email || ''} />
	<InputString field={fields.phone} label="Téléphone de contact" value={event?.phone || ''} />
	<InputLocation field={fields.location} value={event?.location ?? null} />
	<EventFormInputWeb {fields} {event} />

	<InputString field={fields.facebook} label="Page Facebook" value={event?.facebook || ''} />
	<InputString field={fields.instagram} label="Page Instagram" value={event?.instagram || ''} />
</div>
