<script lang="ts">
	import type { Event, EventState, Licence } from '@prisma/client'
	import type { PageData } from './$types'
	import { useForm } from '$lib/validation'
	import { EVENT_STATES } from '$lib/constant'
	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { enhance } from '$app/forms'
	import { PUBLIC_FREE_EVENT_MAX_MEMBERS } from '$env/static/public'
	import { tip } from '$lib/action'

	export let event: Event
	export let eventCounts: PageData['eventCounts']

	const nextStates: Record<EventState, { state: EventState; label: string }[]> = {
		draft: [{ state: 'actived', label: 'Activer' }],
		actived: [
			{ state: 'published', label: 'Publier' },
			{ state: 'archived', label: 'Archiver' },
		],
		published: [
			{ state: 'actived', label: 'Maintenance' },
			{ state: 'archived', label: 'Archiver' },
		],
		archived: [{ state: 'published', label: 'Republier' }],
	}
</script>

<div
	class="
    md:px-8 p-4 rounded-lg border flex flex-col gap-3
    {EVENT_STATES[event.state].class}
  "
>
	<div>
		<div class="flex gap-2 items-center">
			<Icon
				path={EVENT_STATES[event.state].icon}
				class="opacity-80 {event.state === 'draft' ? 'rotate-12' : ''}"
			/>
			<h3 class="title">{EVENT_STATES[event.state].label}</h3>
			{#if event.state === 'draft'}
				<div
					use:tip={{
						content: `${eventCounts.membersValided} membres validés pour ${PUBLIC_FREE_EVENT_MAX_MEMBERS} possibles`,
					}}
					role="progressbar"
					class="radial-progress bg-warning text-xs opacity-80 ml-auto"
					style="--value:{(eventCounts.membersValided / +PUBLIC_FREE_EVENT_MAX_MEMBERS) *
						100}; --size: 3rem;"
				>
					{eventCounts.membersValided} / {PUBLIC_FREE_EVENT_MAX_MEMBERS}
				</div>
			{:else}
				{@const maxMembers = eventCounts.membersLicenced + eventCounts.memberLicencesAvailable}

				<div
					use:tip={{
						content: `Encore ${eventCounts.memberLicencesAvailable} licences disponibles`,
					}}
					role="progressbar"
					class="radial-progress text-xs bg-primary/10 opacity-80 ml-auto"
					style="--value:{(eventCounts.membersLicenced / maxMembers) * 100}; --size: 3rem;"
				>
					{eventCounts.membersLicenced} / {maxMembers}
				</div>
			{/if}
		</div>

		<p class="text-sm opacity-60 mt-1">
			{@html EVENT_STATES[event.state].description}
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
