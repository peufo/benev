<script lang="ts">
	import type { Event, EventState } from '@prisma/client'
	import { useForm } from 'fuma/validation'
	import { Icon } from 'fuma'
	import { EVENT_STATES } from '$lib/constant'
	import { eventPath } from '$lib/store'
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'
	import { useNotify } from '$lib/notify'

	export let event: Event & { owner: { firstName: string } }
	export let isOwner: boolean

	function getNextStates(): Record<EventState, { state: EventState; label: string }[]> {
		return {
			draft: [{ state: 'published', label: 'Publier' }],
			published: [
				{ state: 'draft', label: 'Repasser en brouillon' },
				{ state: 'archived', label: 'Archiver' },
			],
			archived: [{ state: 'published', label: 'Republier' }],
		}
	}

	const notify = useNotify()

	function handleClickState(e: MouseEvent | KeyboardEvent) {
		if (!$page.data.userIsRoot && !$page.data.member?.roles.includes('owner')) {
			e.preventDefault()
			const owner = `${$page.data.member?.firstName} ${$page.data.member?.lastName}`
			notify.warning(`Seul le propriétaire, ${owner}, peut changer le status de cet évènement`)
		}
	}
</script>

<div
	class="
    {EVENT_STATES[event.state].class}
    md:px-8 p-4 rounded-2xl flex flex-col gap-3 bg-base-100 border
  "
>
	<div>
		<div class="flex gap-2 items-center flex-wrap">
			<Icon
				path={EVENT_STATES[event.state].icon}
				class="opacity-80 {event.state === 'draft' ? 'rotate-12' : ''}"
			/>
			<h3 class="title">{EVENT_STATES[event.state].label}</h3>
		</div>

		<p class="text-sm opacity-80 mt-1">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html EVENT_STATES[event.state].description}
		</p>
	</div>

	{#if event.state == 'draft' && !isOwner}
		<p class="badge badge-warning gap-1">
			<b>{event.owner.firstName}</b>
			doit publier l'évènement.
		</p>
	{:else}
		<div class="flex gap-2 justify-end grow items-center">
			{#each getNextStates()[event.state] as { state, label }}
				{@const form = useForm()}
				<form
					use:enhance={form.submit}
					action="{$eventPath}/admin/event?/set_state_event"
					method="post"
					class="contents"
				>
					<input type="hidden" name="state" value={state} />
					<button
						class="btn btn-sm btn-primary"
						on:click={handleClickState}
						on:keydown={handleClickState}
					>
						{label}
					</button>
				</form>
			{/each}
		</div>
	{/if}
</div>
