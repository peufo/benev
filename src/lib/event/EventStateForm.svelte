<script lang="ts">
	import type { Event, EventState } from '@prisma/client'
	import { useForm } from '$lib/validation'
	import { EVENT_STATES } from '$lib/constant'
	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { enhance } from '$app/forms'
	export let event: Event

	const nextStates: Record<EventState, { state: EventState; label: string }[]> = {
		draft: [{ state: 'active', label: 'Publier' }],
		active: [
			{ state: 'draft', label: 'Maintenance' },
			{ state: 'archived', label: 'Archiver' },
		],
		archived: [{ state: 'active', label: 'Republier' }],
	}
</script>

<div
	class="
    px-4 md:px-8 py-3 rounded-lg border flex justify-between flex-wrap gap-1
    {EVENT_STATES[event.state].class}
  "
>
	<div>
		<div class="flex gap-2 items-center">
			<Icon
				path={EVENT_STATES[event.state].icon}
				class="opacity-80 {event.state === 'draft' ? 'rotate-12' : ''}"
			/>
			<span class="font-medium opacity-80">{EVENT_STATES[event.state].label}</span>
		</div>

		<p class="text-sm opacity-60">
			{EVENT_STATES[event.state].description}
		</p>
	</div>

	<div class="flex gap-2 justify-end grow">
		{#each nextStates[event.state] as { state, label }}
			{@const form = useForm()}
			<form
				use:enhance={form.submit}
				action="{$eventPath}/admin/config?/set_state_event"
				method="post"
				class="contents"
			>
				<input type="hidden" name="state" value={state} />
				<button class="btn btn-sm btn-outline">{label}</button>
			</form>
		{/each}
	</div>
</div>
